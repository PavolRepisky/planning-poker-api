FROM node:18

WORKDIR /app

COPY ["package*.json", ".env.development", "./"]

RUN npm install

COPY prisma/schema.prisma ./prisma/

# RUN npx prisma generate - no models yet

COPY . .

RUN npm run build

EXPOSE 3000

CMD [ "npm", "start" ]