#!/bin/bash

if ! yarn migration; then
	printf "Migration FAILED\n"
	exit 1
fi

if ! yarn seed; then
	printf "Seeding FAILED\n"
	exit 2
fi

exit 0
