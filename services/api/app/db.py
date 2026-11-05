from functools import lru_cache

from supabase import Client, create_client

from .config import Settings, get_settings


@lru_cache
def get_service_client() -> Client:
    settings = get_settings()
    if not settings.supabase_service_role_key:
        raise RuntimeError("SUPABASE_SERVICE_ROLE_KEY is required for the API service role client")
    return create_client(settings.supabase_url, settings.supabase_service_role_key)


def get_settings_dep() -> Settings:
    return get_settings()
