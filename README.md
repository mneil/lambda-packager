# Lambda Packager

Yet another lambda packager. Native tooling for python and node lambda packages (no docker)

## Common lambda packaging things

1.  What type of project is it? Python, node, go, java, etc...?
2.  Where are the dependencies declared? Usually easy except python makes it... not easy. Go, is there a mod file or not?
3.  Create a temporary directory to work in
4.  Copy source files to that directory
5.  Install dependencies into that directory
6.  Archive the directory
7.  Upload that archive to S3 and give it a distinct name
8.  Inject that name somewhere? That's up to the user. We'll simply output the distinct name to be used....
