FROM node:12-alpine

WORKDIR /app

COPY ./ .
RUN apk update && \
    apk add --no-cache bash && \
    yarn install --forzen-lockfile && \
    addgroup -S user && \
    adduser -S -G user user && \
    chown -R user:user ./

USER user

# Default port to expose
# EXPOSE 8080

# Heroku (with bootstrap-database script launched at startup)
CMD [ "./entryscript.sh" ]
# Host any where
# CMD [ "yarn", "run", "prod" ]