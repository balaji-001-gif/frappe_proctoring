from setuptools import setup, find_packages
import os

with open("requirements.txt") as f:
	install_requires = f.read().strip().split("\n")

version = "0.0.1"
try:
	with open(os.path.join("frappe_proctoring", "__init__.py")) as f:
		for line in f:
			if line.startswith("__version__"):
				version = line.split("=")[1].strip().strip('"').strip("'")
				break
except:
	pass

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
