############################################################
# Dockerfile to build Wikiserver
# Based on Ubuntu
############################################################

# Set the base image to Ubuntu
FROM python:3.4


# File Author / Maintainer
MAINTAINER Teodor Stefu

# Add the application resources URL
RUN echo "deb http://archive.ubuntu.com/ubuntu/ $(lsb_release -sc) main universe" >> /etc/apt/sources.list

COPY . /python_app

COPY requirements.txt /usr/src/python_app/


# Set the default directory where CMD will execute
WORKDIR /python_app

# Copy the application folder inside the container

# Get pip to download and install requirements:
RUN pip install -r requirements.txt

# Expose ports
EXPOSE 3005

CMD [ "python3.4", "server.py" ]


