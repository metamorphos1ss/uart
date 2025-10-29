import asyncio

from ..config import TOKEN

from .admin_mw import AdminCheckMiddleware #type: ignore

from aiogram import Bot, Dispatcher
from aiogram.exceptions import TelegramAPIError
from aiogram.types import Message
from aiogram.filters import CommandStart



async def main():
    bot = Bot(token=TOKEN)
    dp = Dispatcher()

    dp.message.middleware(AdminCheckMiddleware())

    @dp.message(CommandStart)
    async def start(message: Message):
        await message.answer('priv')

    try:
        await dp.start_polling(bot)
    finally:
        await bot.session.close()

if __name__ == "__main__":
    asyncio.run(main())
