#!/bin/sh
set -e
killall -9 betwin-smartpc 2>/dev/null || true
killall -9 betwise-smartpc 2>/dev/null || true
killall -9 winbet-smart-pc 2>/dev/null || true
exit 0
