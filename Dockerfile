FROM siomiz/node-opencv:2.4.x
ENV NODE_ENV development
WORKDIR /usr/src/app
EXPOSE 8888
CMD ["/bin/bash"]
