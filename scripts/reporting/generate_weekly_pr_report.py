from pathlib import Path
import json
import re
import subprocess
from datetime import datetime, timedelta, timezone

OUTPUT_DIR = Path("docs/process/weekly-reports")
BASE_BRANCH = "main"
DAYS_BACK = 7
LIMIT = 200
REPO = "TorgrimRL/inventory_x"


def run_gh_command():
    cmd = [
        "gh", "pr", "list",
        "--repo", REPO,
        "--state", "merged",
        "--base", BASE_BRANCH,
        "--limit", str(LIMIT),
        "--json", "number,title,mergedAt,author,body,url",
    ]

    result = subprocess.run(cmd, capture_output=True, text=True)

    if result.returncode != 0:
        raise RuntimeError(
            "Failed to fetch PRs with gh.\n"
            f"stderr:\n{result.stderr}"
        )

    return json.loads(result.stdout)


def parse_merged_at(iso_date: str) -> datetime:
    return datetime.fromisoformat(iso_date.replace("Z", "+00:00")).astimezone(timezone.utc)


def filter_prs_for_period(prs, start_date: str, end_date: str):
    start_dt = datetime.fromisoformat(start_date).replace(tzinfo=timezone.utc)
    end_dt = datetime.fromisoformat(end_date).replace(tzinfo=timezone.utc)

    return [
        pr for pr in prs
        if start_dt <= parse_merged_at(pr["mergedAt"]) < end_dt
    ]


def clean_lines(text: str) -> str:
    if not text:
        return ""

    lines = [line.rstrip() for line in text.splitlines()]
    cleaned_lines = []

    template_lines_to_skip = {
        "closes what tasks or user story#",
        "anything reviewers should know (migrations, env vars, ui changes, etc.)",
    }

    for line in lines:
        stripped = line.strip()
        lowered = stripped.lower()

        if not stripped:
            continue

        if stripped in {"-", "*"}:
            continue

        if lowered in template_lines_to_skip:
            continue

        cleaned_lines.append(line)

    return "\n".join(cleaned_lines).strip()


def extract_section(body: str, heading: str) -> str:
    if not body:
        return ""

    pattern = rf"(?is)##\s*{re.escape(heading)}\s*(.*?)(?:\n##\s|\Z)"
    match = re.search(pattern, body)
    if not match:
        return ""

    return clean_lines(match.group(1).strip())


def extract_summary(body: str) -> str:
    if not body:
        return ""

    what_changed = extract_section(body, "What changed")
    if what_changed:
        return what_changed

    match = re.search(
        r"(?is)##\s*Closes\s*(.*?)(?:\n##\s*How to test\s*|\Z)",
        body,
    )
    if not match:
        return ""

    return clean_lines(match.group(1).strip())


def format_date(iso_date: str) -> str:
    try:
        dt = datetime.fromisoformat(iso_date.replace("Z", "+00:00"))
        return dt.strftime("%Y-%m-%d %H:%M UTC")
    except ValueError:
        return iso_date


def build_report(prs, start_date: str, end_date: str, report_date: str) -> str:
    lines = [
        "# Pull requests merged to main since the previous TA meeting",
        "",
        f"- Report date: {report_date}",
        f"- Period: {start_date} to {end_date}",
        f"- Base branch: `{BASE_BRANCH}`",
        f"- Number of PRs: {len(prs)}",
        "",
    ]

    if not prs:
        lines.append("_No PRs were merged during this period._")
        lines.append("")
        return "\n".join(lines)

    # Sort oldest first so the report is read chronologically
    prs = sorted(prs, key=lambda pr: pr["mergedAt"])

    for pr in prs:
        number = pr["number"]
        title = pr["title"]
        merged_at = format_date(pr["mergedAt"])
        author = pr.get("author", {}).get("login", "unknown")
        url = pr["url"]
        summary = extract_summary(pr.get("body", ""))

        lines.extend([
            f"## PR #{number} - {title}",
            "",
            f"- Merged: {merged_at}",
            f"- Author: {author}",
            f"- URL: {url}",
            "",
            "### Summary",
            "",
            summary if summary else "_No filled-in summary found._",
            "",
        ])

    return "\n".join(lines)


def main():
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    end_date = datetime.now(timezone.utc).date()
    start_date = end_date - timedelta(days=DAYS_BACK)
    report_date = end_date.isoformat()

    all_prs = run_gh_command()
    prs = filter_prs_for_period(
        all_prs,
        start_date.isoformat(),
        end_date.isoformat(),
    )

    output_file = OUTPUT_DIR / f"{report_date}-merged-prs.md"

    report = build_report(
        prs,
        start_date.isoformat(),
        end_date.isoformat(),
        report_date,
    )
    output_file.write_text(report, encoding="utf-8")

    print(f"Wrote {output_file} ({len(prs)} PRs)")


if __name__ == "__main__":
    main()
