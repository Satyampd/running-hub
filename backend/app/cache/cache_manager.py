from typing import List, Dict, Any
import json
import os
from datetime import datetime, timedelta
from pathlib import Path

class CacheManager:
    def __init__(self, cache_dir: str = None, cache_duration_hours: int = 6):
        # Use an absolute path for the cache directory
        if cache_dir is None:
            # Default cache directory is at backend/cache
            backend_dir = Path(__file__).parent.parent.parent
            self.cache_dir = os.path.join(backend_dir, "cache")
        else:
            self.cache_dir = cache_dir
            
        self.cache_duration = timedelta(hours=cache_duration_hours)
        
        # Create cache directory if it doesn't exist
        if not os.path.exists(self.cache_dir):
            os.makedirs(self.cache_dir)
    
    def _get_cache_file(self, source: str) -> str:
        """Get the cache file path for a specific source"""
        return os.path.join(self.cache_dir, f"{source.lower()}_events.json")
    
    def is_cache_valid(self, source: str) -> bool:
        """Check if cache for a source is still valid"""
        cache_file = self._get_cache_file(source)
        
        if not os.path.exists(cache_file):
            return False
            
        file_modified_time = datetime.fromtimestamp(os.path.getmtime(cache_file))
        return datetime.now() - file_modified_time < self.cache_duration
    
    def get_cached_events(self, source: str) -> List[Dict[str, Any]]:
        """Get events from cache for a specific source"""
        cache_file = self._get_cache_file(source)
        
        if not os.path.exists(cache_file):
            return []
            
        try:
            with open(cache_file, 'r') as f:
                return json.load(f)
        except Exception as e:
            print(f"Error reading cache for {source}: {e}")
            # Delete corrupt cache file
            try:
                os.remove(cache_file)
                print(f"Deleted corrupt cache file for {source}")
            except:
                pass
            return []
    
    def cache_events(self, source: str, events: List[Dict[str, Any]]) -> None:
        """Cache events for a specific source"""
        cache_file = self._get_cache_file(source)
        
        try:
            with open(cache_file, 'w') as f:
                json.dump(events, f, indent=2)
        except Exception as e:
            print(f"Error caching events for {source}: {e}")
            
    def clear_cache(self, source: str = None) -> None:
        """Clear cache for a specific source or all sources"""
        if source:
            cache_file = self._get_cache_file(source)
            if os.path.exists(cache_file):
                os.remove(cache_file)
                print(f"Cache cleared for {source}")
        else:
            for file in os.listdir(self.cache_dir):
                if file.endswith('_events.json'):
                    os.remove(os.path.join(self.cache_dir, file))
            print("All cache cleared") 