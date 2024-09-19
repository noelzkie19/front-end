#pull official base image
FROM node:14.17.6 AS builder

# set working directory
WORKDIR /app


# install app dependencies
#copies package.json and package-lock.json to Docker environment
COPY package.json ./

# Installs all node packages
RUN yarn cache clean
RUN yarn install
RUN yarn remove sass
RUN yarn add node-sass@4.14.1
RUN yarn add npm-force-resolutions

# fontawesome
# RUN yarn remove @fortawesome/fontawesome-free
# RUN yarn remove @fortawesome/fontawesome-svg-core
# RUN yarn remove @fortawesome/free-solid-svg-icons
# RUN yarn remove @fortawesome/react-fontawesome
# RUN yarn remove react-datepicker
# RUN yarn remove react-inlinesvg

# RUN yarn add @fortawesome/fontawesome-common-types@0.2.36
# RUN yarn add @fortawesome/fontawesome-free@5.15.3
# RUN yarn add @fortawesome/fontawesome-svg-core@1.2.36
# RUN yarn add @fortawesome/free-solid-svg-icons@5.15.4
# RUN yarn add @fortawesome/react-fontawesome@0.1.16
# RUN yarn add react-datepicker@4.3.0
# RUN yarn add react-inlinesvg@2.3.0


# RUN yarn remove rsuite
# RUN yarn add rsuite@5.1.0

# RUN yarn remove bootstrap
# RUN yarn add bootstrap@5.1.3


# Copies everything over to Docker environment
COPY . ./
RUN yarn build
RUN yarn

#Stage 2
#######################################
#pull the official nginx:1.19.0 base image
FROM nginxinc/nginx-unprivileged
#copies React to the container directory
# Create a group and user so we are not running our container and application as root and thus user 0 which is a security issue.
#RUN addgroup --system --gid 1000 customgroup \
#&& adduser --system --uid 1000 --ingroup customgroup --shell /bin/sh customuser
# Set working directory to nginx resources directory
WORKDIR /usr/share/nginx/html
# Remove default nginx static resources
#RUN rm -rf ./*
# Copies static resources from builder stage
COPY --from=builder /app/build .
# Add your nginx.conf
COPY nginx.conf /etc/nginx/conf.d/default.conf
# Containers run nginx with global directives and daemon off

#RUN chown -R customuser /usr/share/nginx/html
#RUN chown -R customuser /root
#USER customuser
EXPOSE 8080

#RUN chown -R customuser /usr/share/nginx/html
#RUN chown -R customuser /root
#USER customuser
EXPOSE 8080
ENTRYPOINT ["nginx", "-g", "daemon off;"]
