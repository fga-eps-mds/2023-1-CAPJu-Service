#!/bin/bash

curl_json() {
	local -r method="$1"
	local -r json="$2"
	local -r url="$3"

	curl \
	--insecure \
	--header 'Content-Type: application/json' \
	--request "${method}" \
	--data "${json}" \
	"${url}"

	return $?
}

test_init() {
	local -r COMPOSE_UP_DELAY=5
	local -r MIGRATION_DELAY=1
	local -r SERVER_DELAY=5

	printf "Cleaning 'data' directory\n" 1>&2
	gio trash 'data'

	mkdir --verbose 'data'

	printf "Starting database container\n" 1>&2
	docker-compose up --no-color &
	sleep ${COMPOSE_UP_DELAY}

	printf "Running migrations\n" 1>&2
	yarn sequelize db:migrate
	sleep ${MIGRATION_DELAY}

	printf "Starting server\n" 1>&2
	npx nodemon --experimental-json-modules --no-colors src/server.js &
	sleep ${SERVER_DELAY}

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
	pkill --full 'node .* src/server.js'

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

	if jq --exit-status '.' <<< "${maybe_json}"; then
		printf "Request is a valid JSON\n" 1>&2
		return $(true)
	else
		printf "Request is NOT a valid JSON\n" 1>&2
		return $(false)
	fi
}

json_field_equals() {
	local -r field_name="$1"
	local -r expected_value="$2"
	local -r maybe_json="$3"

	local output
	local estatus

	if ! is_json "${maybe_json}"; then
		return $(false)
	fi

	output=$(jq --exit-status ".[\"${field_name}\"] == ${expected_value}" <<< "${maybe_json}")
	estatus=$?

	if [[ $estatus == 0 ]]; then
		if [[ "${output}" == "true" ]]; then
			return $(true)
		else
			printf "On field '.%s': Expected '%s'\n" "${field_name}" "${expected_value}" 1>&2
			return $(false)
		fi
	else
		return $(false)
	fi
}

is_json_field_number() {
	local -r field_name="$1"
	local -r maybe_json="$2"

	if ! is_json "${maybe_json}"; then
		return $(false)
	fi

	if ! jq --exit-status ".[\"${field_name}\"] | numbers" <<< "${output}"; then
		printf "'.%s' is not a number\n" "${field_name}" 1>&2
		return 1
	fi

	return $(true)
}

is_json_field_string() {
	local -r field_name="$1"
	local -r maybe_json="$2"

	if ! is_json "${maybe_json}"; then
		return $(false)
	fi

	if ! jq --exit-status ".[\"${field_name}\"] | strings" <<< "${output}"; then
		printf "'.%s' is not a string\n" "${field_name}" 1>&2
		return 1
	fi

	return $(true)
}

test_new_unit() {
	local output
	local estatus

	printf "\nBegin test '%s'\n" "${FUNCNAME[0]}"

	output=$(run_simple_test "POST" '{"name": "nomeunidade"}' 'https://localhost:3333/newUnit')
	estatus=$?

	if [[ $estatus == 0 ]]; then
		printf "Request returned\n" 1>&2

		if ! json_field_equals "idUnit" "1" "${output}"; then
			return 1
		fi

		if ! json_field_equals "name" '"nomeunidade"' "${output}"; then
			return 2
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

	output=$(send_test_request "POST" '{"name": "nomeunidade1"}' 'https://localhost:3333/newUnit')
	estatus=$?

	if [[ $estatus == 0 ]]; then
		printf "Request returned\n" 1>&2

		if ! json_field_equals "idUnit" "1" "${output}"; then
			test_clean
			return 1
		fi

		if ! json_field_equals "name" '"nomeunidade1"' "${output}"; then
			test_clean
			return 2
		fi
	else
		echo "${FUNCNAME[0]} failed with status $estatus, returned '${output}'" 1>&2
		test_clean
		return 2
	fi

	output=$(send_test_request "POST" '{"name": "nomeunidade2"}' 'https://localhost:3333/newUnit')
	estatus=$?

	if [[ $estatus == 0 ]]; then
		printf "Request returned\n" 1>&2

		if ! json_field_equals "idUnit" "2" "${output}"; then
			test_clean
			return 3
		fi

		if ! json_field_equals "name" '"nomeunidade2"' "${output}"; then
			test_clean
			return 4
		fi
	else
		echo "${FUNCNAME[0]} failed with status $estatus, returned '${output}'" 1>&2
		test_clean
		return 4
	fi

	output=$(send_test_request "GET" '' 'https://localhost:3333/unit')
	estatus=$?

	if [[ $estatus == 0 ]]; then
		printf "Request returned\n" 1>&2

		if ! is_json "${output}"; then
			test_clean
			return 5
		fi

		output=$(jq --exit-status 'length' <<< "${output}")
		estatus=$?

		if [[ $estatus == 0 ]]; then
			if [[ $output != 2 ]]; then
				printf "Expected length '%d' but got '%d'\n" "2" "${output}" 1>&2
				test_clean
				return 7
			fi
		else
			test_clean
			return 8
		fi
	else
		echo "${FUNCNAME[0]} failed with status $estatus, returned '${output}'" 1>&2
		test_clean
		return 6
	fi

	test_clean

	return 0
}

test_new_stage() {
	local output
	local estatus

	printf "\nBegin test '%s'\n" "${FUNCNAME[0]}"

	test_init

	output=$(send_test_request "POST" '{"name": "nomeunidade1"}' 'https://localhost:3333/newUnit')
	estatus=$?

	if ! is_json "${output}"; then
		echo "${FUNCNAME[0]} got status $estatus, returned '${output}'" 1>&2
		test_clean
		return 1
	fi

	output=$(send_test_request "POST" '{"name": "estag1", "idUnit": 1, "duration": 2}' 'https://localhost:3333/newStage')
	estatus=$?

	if [[ $estatus == 0 ]]; then
		printf "Request returned\n" 1>&2

		if ! json_field_equals "idStage" "1" "${output}"; then
			test_clean
			return 2
		fi

		if ! json_field_equals "name" '"estag1"' "${output}"; then
			test_clean
			return 3
		fi

		if ! json_field_equals "idUnit" "1" "${output}"; then
			test_clean
			return 4
		fi
	else
		echo "${FUNCNAME[0]} got status $estatus, returned '${output}'" 1>&2
		test_clean
		return 5
	fi

	test_clean

	return 0
}

main() {
	if ! command -v jq &>/dev/null; then
		echo "Please install 'jq'"
		return 1
	fi

	if ! command -v gio &>/dev/null; then
		echo "Please install 'libglib2' and 'gvfs'"
		return 1
	fi

	local api_tests=(
		test_new_unit
		test_new_units_list
		test_new_stage
	)

	local total_tests=${#api_tests[@]}
	local successful_tests=0
	local failed_tests=0
	local executed_tests=0
	local time_begin=0
	local time_end=0

	time_begin=$(date '+%s')
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
	time_end=$(date '+%s')

	printf "\ntotal_tests=%d\n" $total_tests
	printf "successful_tests=%d\n" $successful_tests
	printf "failed_tests=%d\n" $failed_tests
	printf "executed_tests=%d\n" $executed_tests
	printf "test_execution_time_seconds=%d\n" $((time_end - time_begin))

	return 0
}

main 2>&1 | tee "$(date '+%Y-%m-%dT%H%M%S%z').log"

exit ${PIPESTATUS[0]}
