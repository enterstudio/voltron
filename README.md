# Voltron: Test your Zetta cluster

Voltron is a CLI or API based solution for creating mock Zetta instances to peer with a cloud deployment. It is also used to traverse a Zetta API or subscribe to Websockets. All of this functionality can be stood up indefinitely and controlled by API as well.

## Generate peers

```
  Usage: voltron test load [options] [url]

  Options:

    -h, --help               output usage information
    -i --instances <number>  Number of instances to start. Default 10.
    -s --sensors <number>    Number of sensors per instance
    -a --actuators <number>  Number of actuators per instance
    -f, --file               Output to a file
    -s, --silent             Silence output
    --spec <path>            Specification file path.
    -t --time <time>         Time in seconds to run test for. Defaults to 60.
    --csv                    Format output as csv.
    --csv-headers            Add headers to csv output.
```

## Generate HTTP API Requests

```
  Usage: voltron test api [options] [url]

  Options:

    -h, --help                output usage information
    -r --requests <requests>  Requests to send
    -t --time <time>          Time in seconds to run test for. Defaults to 60
    -c --clients <number>     Number of clients to generate
    -rps --rate <number>      Number of requests per second
```

## Generate Websocket Subscriptions

```
  Usage: voltron test ws [options] [url]

  Options:

    -h, --help               output usage information
    -i --instances <number>  Number of instances to start. Default 10.
    -f, --file               Output to a file
    -s, --silent             Silence output
    --spec <path>            Specification file path.
    -t --time <time>         Time in seconds to run test for. Defaults to 60.
```

## Start API to control testing utilities

```
  Usage: voltron start api [options]

  Options:

    -h, --help        output usage information
    -p --port <port>  port number for server to listen on.
    -l --link <link>  link the voltron API to another zetta.
```