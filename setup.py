from setuptools import setup, find_packages

with open("requirements.txt") as f:
	install_requires = f.read().strip().split("\n")

from frappe_proctoring import __version__ as version

setup(
	name="frappe_proctoring",
	version=version,
	description="AI Based Online Exam Proctoring System for Frappe",
	author="Frappe User",
	author_email="frappe@example.com",
	packages=find_packages(),
	zip_safe=False,
	include_package_data=True,
	install_requires=install_requires
)
