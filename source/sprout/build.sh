#!/bin/bash
# app only (fast): the patch chain into sprout_v2.html and the test copy v2_test.html
cd "$(dirname "$0")" && python3 mk3.py && python3 mk4.py && python3 mk5.py && python3 mktest.py
