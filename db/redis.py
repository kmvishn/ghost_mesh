import logging
import redis
from config import settings

class MockRedis:
    def __init__(self):
        self.store = {}
        logging.info("Initialized in-memory MockRedis engine successfully.")

    def set(self, key, value, ex=None):
        self.store[key] = str(value)
        return True

    def get(self, key):
        val = self.store.get(key)
        if val is None:
            return None
        return str(val)

    def delete(self, *keys):
        count = 0
        for k in keys:
            if k in self.store:
                del self.store[k]
                count += 1
        return count

    def sadd(self, key, *values):
        if key not in self.store or not isinstance(self.store[key], set):
            self.store[key] = set()
        for val in values:
            self.store[key].add(str(val))
        return len(values)

    def smembers(self, key):
        val = self.store.get(key)
        if val is None:
            return set()
        # Convert values to strings/bytes to mimic redis client smembers returning set of strings
        return {str(v) for v in val}

    def lpush(self, key, *values):
        if key not in self.store or not isinstance(self.store[key], list):
            self.store[key] = []
        # Redis LPUSH prepends
        for val in reversed(values):
            self.store[key].insert(0, val)
        return len(self.store[key])

    def rpush(self, key, *values):
        if key not in self.store or not isinstance(self.store[key], list):
            self.store[key] = []
        for val in values:
            self.store[key].append(val)
        return len(self.store[key])

    def lrange(self, key, start, end):
        lst = self.store.get(key)
        if lst is None:
            return []
        if not isinstance(lst, list):
            return []
        if end == -1:
            return lst[start:]
        return lst[start:end+1]

    def expire(self, key, time):
        return True

# Initialize client with robust connection check
try:
    logging.info("Attempting to connect to real Redis server...")
    real_client = redis.from_url(settings.REDIS_URL, decode_responses=True, socket_timeout=3.0)
    # Ping the server to verify active link
    real_client.ping()
    logging.info("Successfully connected to real Redis server.")
    redis_client = real_client
except Exception as e:
    logging.warning(f"Failed to connect to real Redis: {e}. Falling back to MockRedis.")
    redis_client = MockRedis()
