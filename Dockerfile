FROM zenika/alpine-chrome:with-node

COPY . .

RUN npm ci

CMD ["node", "server"]