from django.core.management.base import BaseCommand
from django.contrib.auth.hashers import make_password
from products.models import Compte


class Command(BaseCommand):

    help = "Create the first admin account"

    def handle(self, *args, **options):

        if Compte.objects.filter(
            role=Compte.Role.ADMIN
        ).exists():

            self.stdout.write(
                self.style.ERROR(
                    "An ADMIN account already exists."
                )
            )

            return

        username = input("Admin username: ")
        password = input("Admin password: ")

        if not username or not password:

            self.stdout.write(
                self.style.ERROR(
                    "Username and password are required."
                )
            )

            return

        if Compte.objects.filter(
            username=username
        ).exists():

            self.stdout.write(
                self.style.ERROR(
                    "Username already exists."
                )
            )

            return

        compte = Compte.objects.create(
            username=username,
            password=make_password(password),
            role=Compte.Role.ADMIN
        )

        self.stdout.write(
            self.style.SUCCESS(
                f"ADMIN '{compte.username}' created successfully."
            )
        )