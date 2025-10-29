import asyncio
from ..config import TOKEN

from aiogram import Bot, Dispatcher
from aiogram.dispatcher.filters import CommandStart
from aiogram.types import Message
bot = Bot(token=TOKEN)
dp = Dispatcher(bot)

@dp.message_handler(CommandStart())
async def welcome(message: Message) -> None:
    welcome_text = "priv"
    await message.answer(welcome_text)

async def main() -> None:
    await dp.start_polling()
    
if __name__ == "__main__":
    asyncio.run(main())
