FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .

RUN mkdir -p uploads/passports

EXPOSE 5000
CMD ["npm", "start"]
