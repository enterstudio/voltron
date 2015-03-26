#!/bin/sh

ps aux | grep node | grep test_template.js | awk '{ print $2 }' | xargs kill
