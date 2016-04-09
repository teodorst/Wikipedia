"""Module for loading environement variable defined in .env """

from os.path import join, dirname
import dotenv

DOTENV_PATH = join(dirname(__file__), '.env')
dotenv.read_dotenv(DOTENV_PATH)


