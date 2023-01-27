export const queryUsersNotificate = 'SELECT \
"flowUser"."idFlow", "flowUser".cpf, users."fullName", users.email, users."idUnit" \
FROM "flowUser" \
JOIN users ON "flowUser".cpf = users.cpf \
WHERE "flowUser"."idFlow" = ?';