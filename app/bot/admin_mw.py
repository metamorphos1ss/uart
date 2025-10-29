from aiogram import BaseMiddleware
from aiogram.types import Message
from typing import Any, Callable, Dict, Awaitable
from ..config import ADMIN_IDS

class AdminCheckMiddleware(BaseMiddleware):
    async def __call__( #type: ignore
        self,
        handler: Callable[[Message, Dict[str, Any]], Awaitable[Any]],
        event: Message,
        data: Dict[str, Any]
    ) -> Any:

        user_id = event.from_user.id #type: ignore
        if user_id not in ADMIN_IDS:
            return 

        return await handler(event, data)
