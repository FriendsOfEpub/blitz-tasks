# markupatron

Automating markup changes with node, gulp and config files

## Install

First make sure you have nodeJS and npm installed. 

We recommend installing the dev dependencies locally so that this repo can be used as a template.

```
npm install -g gulp gulp-cheerio
```

Then 

```
npm install
```

## Usage

Make a custom/modify the existing config file then:

```
gulp <task> --config "path/to/config.json"
```

### Config

TBD

### Examples

This will run all tasks with the existing config file:

```
gulp
```

This will run all tasks with a custom config file:

```
gulp -c "./input/another-config.json"
```

This will only run the retag task with the existing config file:

```
gulp retag
```

This will only run the retag task with a custom config file:

```
gulp retag --config "./input/another-config.json"
```