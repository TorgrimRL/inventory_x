import secrets
import time

from django.core.cache import cache
from django.test import TestCase


class OtcCachTests(TestCase):
    def test_timer(self):
        key = secrets.token_hex(32)
        val = "mail@here.com"
        cache.set(key, val, 2)

        incache_val = cache.get(key)
        self.assertEqual(val, incache_val)

        # cache.delete(key)
        time.sleep(2.1)

        incache_val = cache.get(key)
        self.assertIsNone(incache_val)
