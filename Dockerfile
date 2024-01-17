FROM amd64/oraclelinux:9

COPY mysql-enterprise-8.2.0-javascript_el9_x86_64_bundle.tar .
COPY entrypoint.sh /entrypoint.sh
RUN chmod og+x /entrypoint.sh
COPY healthcheck.sh /healthcheck.sh
RUN mkdir /mysql
RUN tar xvf mysql-enterprise-8.2.0-javascript_el9_x86_64_bundle.tar --directory /mysql
RUN rpm --import https://repo.mysql.com/RPM-GPG-KEY-mysql-2022
RUN yum install yum-utils
RUN yum-config-manager --add file:///mysql
RUN chmod og+r /var/cache/dnf/expired_repos.json
RUN yum install mysql-commercial-server && \
yum install mysql-commercial-backup && \
yum install mysql-connector-c++-commercial && \
yum install mysql-connector-c++-commercial-jdbc && \
yum install mysql-connector-j-commercial && \
yum install mysql-connector-odbc-commercial && \
yum install mysql-connector-odbc-commercial-setup && \
yum install mysql-connector-python3-commercial && \
yum install mysql-router-commercial && \
yum install mysql-shell-commercial

ENTRYPOINT ["/entrypoint.sh"]
HEALTHCHECK CMD /healthcheck.sh
EXPOSE 3306 33060 33061
CMD ["mysqld"]
