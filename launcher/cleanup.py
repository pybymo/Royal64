from launcher.logger import info, success
from launcher.pid_manager import PIDManager


class Cleanup:

    @staticmethod
    def run():

        info("Cleaning previous Royal64 services...")

        PIDManager.kill_all()

        success("Cleanup finished.")