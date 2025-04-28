# FROM ubuntu

# RUN apt update && apt install nodejs npm -y
 # if we will just write node it will pull the latest image else if we will write like node:18-alpine3.18 here the image size is small 
 #with less dependency
 #alpine compress image if we compare it other os like ubuntu,window
 #WORKDIR copy the current directory from /usr/src/app in conatiner helps in writing clean code
 #EVERY code will run in this context
FROM node:19.4-alpine     

WORKDIR /usr/src/app

ENV NODE_ENV production

COPY package*.json ./ 

#when productio  env then use npm ci --only=production will only install dependencies not dev dependencies
# RUN npm ci --only=production
#For decreasing buld time use most optimized cache and mount it in /usr/src/app
RUN --mount=type=cache,target=/usr/src/app/.npm \
    npm set cache /usr/src/app/.npm && \
    npm ci --only=production
# RUN npm install
# RUN npm run build is used to generate static files HTML,CSS
USER node
#it means all the file is now owned by user node which is available in base image of node
COPY --chown=node:node ./src .
#copy from source to working directoryg
COPY ./src .  

CMD ["node", "index.js"]