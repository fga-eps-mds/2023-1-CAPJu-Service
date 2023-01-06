#!/bin/bash

curl_json() {
	local -r method="$1"
	local -r json="$2"
	local -r url="$3"

	curl \
	--header 'Content-Type: application/json' \
	--request "${method}" \
	--data "${json}" \
	"${url}"

	return $?
}

test_init() {
	printf "Cleaning 'data' directory\n" 1>&2
	gio trash 'data'

	mkdir --verbose 'data'

	printf "Starting database container\n" 1>&2
	docker-compose up &
	sleep 5

	printf "Running migrations\n" 1>&2
	yarn sequelize db:migrate
	sleep 1

	printf "Starting server\n" 1>&2
	yarn start &
	sleep 5

	return 0
}

send_test_request() {
	local -r method="$1"
	local -r json="$2"
	local -r url="$3"

	local output
	local estatus

	printf "Sending request\n" 1>&2
	printf "method='%s'\n" "${method}" 1>&2
	printf "json='%s'\n" "${json}" 1>&2
	printf "url='%s'\n" "${url}" 1>&2

	if output=$(curl_json "${method}" "${json}" "${url}"); then
		estatus=0
	else
		estatus=$?
		printf "'%s' failed with status '%s'\n" "${FUNCNAME[0]}" "${estatus}" 1>&2
	fi

	echo "${output}"
	return $estatus
}

test_clean() {
	printf "killing server\n" 1>&2
	kill '%2'
	pkill --full 'node src/server.js'

	printf "Stopping database container\n" 1>&2
	kill '%1'
	docker-compose down

	return 0
}

run_simple_test() {
	local -r method="$1"
	local -r json="$2"
	local -r url="$3"

	local output
	local estatus

	test_init 1>&2

	output=$(send_test_request "${method}" "${json}" "${url}")
	estatus=$?

	test_clean 1>&2

	echo "${output}"
	return $estatus
}

is_json() {
	local maybe_json="$1"

	if jq --exit-status --color-output '.' <<< "${maybe_json}"; then
		return $(true)
	else
		return $(false)
	fi
}

test_new_unit() {
	local output
	local estatus

	printf "\nBegin test '%s'\n" "${FUNCNAME[0]}"

	output=$(run_simple_test "POST" '{"name": "nomeunidade"}' 'http://localhost:3333/newUnit')
	estatus=$?

	if [[ $estatus == 0 ]]; then
		printf "Request returned\n" 1>&2

		if is_json "${output}"; then
			printf "Request is a valid JSON\n" 1>&2
		else
			printf "Request is an INVALID JSON\n" 1>&2
			return 1
		fi
	else
		echo "${FUNCNAME[0]} failed with status $estatus, returned '${output}'" 1>&2
		return 2
	fi

	return 0
}

test_new_units_list() {
	local output
	local estatus

	printf "\nBegin test '%s'\n" "${FUNCNAME[0]}"

	test_init

	output=$(send_test_request "POST" '{"name": "nomeunidade1"}' 'http://localhost:3333/newUnit')
	estatus=$?

	if [[ $estatus == 0 ]]; then
		printf "Request returned\n" 1>&2

		if is_json "${output}"; then
			printf "Request is a valid JSON\n" 1>&2
		else
			printf "Request is an INVALID JSON\n" 1>&2
			test_clean
			return 1
		fi
	else
		echo "${FUNCNAME[0]} failed with status $estatus, returned '${output}'" 1>&2
		test_clean
		return 2
	fi

	output=$(send_test_request "POST" '{"name": "nomeunidade2"}' 'http://localhost:3333/newUnit')
	estatus=$?

	if [[ $estatus == 0 ]]; then
		printf "Request returned\n" 1>&2

		if is_json "${output}"; then
			printf "Request is a valid JSON\n" 1>&2
		else
			printf "Request is an INVALID JSON\n" 1>&2
			test_clean
			return 3
		fi
	else
		echo "${FUNCNAME[0]} failed with status $estatus, returned '${output}'" 1>&2
		test_clean
		return 4
	fi

	output=$(send_test_request "GET" '' 'http://localhost:3333/unit')
	estatus=$?

	if [[ $estatus == 0 ]]; then
		printf "Request returned\n" 1>&2

		if is_json "${output}"; then
			printf "Request is a valid JSON\n" 1>&2
		else
			printf "Request is an INVALID JSON\n" 1>&2
			test_clean
			return 5
		fi
	else
		echo "${FUNCNAME[0]} failed with status $estatus, returned '${output}'" 1>&2
		test_clean
		return 6
	fi

	test_clean

	return 0
}

main() {
	local api_tests=(
		test_new_unit
		test_new_units_list
	)

	local total_tests=${#api_tests[@]}
	local successful_tests=0
	local failed_tests=0
	local executed_tests=0

	for api_test in "${api_tests[@]}"; do
		printf "Running test %d/%d\n" $executed_tests $total_tests 1>&2

		if "${api_test}"; then
			printf "Test '%s' SUCCEEDED\n" "${api_test}" 1>&2
			((successful_tests++))
		else
			printf "Test '%s' FAILED\n" "${api_test}" 1>&2
			((failed_tests++))
		fi

		((executed_tests++))
		sleep 1
	done

	printf "\ntotal_tests=%d\n" $total_tests
	printf "successful_tests=%d\n" $successful_tests
	printf "failed_tests=%d\n" $failed_tests
	printf "executed_tests=%d\n" $executed_tests

	return 0
}

main 2>&1 | tee "$(date '+%Y-%m-%dT%H%M%S%z').log"

exit 0
