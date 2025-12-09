GenericCd.listByTableName=SELECT * FROM lookup.{TABLE_NAME}_cd AS c LEFT JOIN lookup.{TABLE_NAME}_locale AS l ON l.{TABLE_NAME}_cd = c.{TABLE_NAME}_cd WHERE l.locale_cd = ? AND l.end_time = 'infinity'
#-- Contact
Contact=SELECT * FROM public.contact WHERE
Contact.create=INSERT INTO public.contact(login_user_id, contact_cd, login_id) VALUES (?, ?, ?)
Contact.verify=UPDATE public.contact SET verified_on = now() WHERE contact_id = ?
Contact.get=${Contact} contact_id = ?
Contact.getByLoginUserId=${Contact} login_user_id = ? ORDER BY contact_id DESC LIMIT 1
Contact.listByLoginUserId=${Contact} login_user_id = ? AND end_time = 'infinity'
Contact.listByLoginId=${Contact} login_id = ? AND end_time = 'infinity'
Contact.listInLoginId=${Contact} login_id IN (?) AND end_time = 'infinity'
#-- Login User
LoginUser = SELECT * FROM public.login_user 
LoginUser.create=INSERT INTO public.login_user(login_uuid, date_of_birth, individual) VALUES (?, ?, ?)
LoginUser.get=${LoginUser} WHERE login_user_id = ?
LoginUser.getByUuid=${LoginUser} WHERE login_uuid = ?
LoginUser.list=${LoginUser} LIMIT ? OFFSET ?
LoginUser.count=SELECT COUNT(*) FROM public.login_user
LoginUser.update=UPDATE public.login_user SET date_of_birth = ?, individual = ? WHERE login_user_id = ?
#-- Login User Name
LoginUserName=SELECT * FROM public.login_user_name WHERE 
LoginUserName.create=INSERT INTO public.login_user_name(login_user_id, first_name, middle_name, last_name) VALUES (?, ?, ?, ?)
LoginUserName.get=${LoginUserName} login_user_name_id = ?
LoginUserName.getByLoginUserId=${LoginUserName} login_user_id = ? ORDER BY login_user_name_id DESC LIMIT 1
#----Login User Role ----------#
LoginUserRole=SELECT r.*, rc.code AS role FROM public.login_user_role AS r LEFT JOIN lookup.role_cd AS rc ON rc.role_cd = r.role_cd AND rc.end_time = 'infinity' WHERE
LoginUserRole.create=INSERT INTO public.login_user_role(login_user_id, role_cd, remarks) VALUES (?, ?, ?)
LoginUserRole.get=${LoginUserRole} r.login_user_role_id = ?
LoginUserRole.listByLoginUserId=${LoginUserRole} r.login_user_id = ? AND r.end_time = 'infinity'
LoginUserRole.listByLoginRoleCd=${LoginUserRole} r.role_cd = ? AND (r.end_time = 'infinity' OR r.end_time > current_timestamp) ORDER BY login_user_id ASC LIMIT ? OFFSET ?
LoginUserRole.revoke=UPDATE public.login_user_role SET end_time = now() WHERE r.login_user_id = ?
#---- Login History -----
LoginHistory=SELECT * FROM public.login_history WHERE
LoginHistory.create=INSERT INTO public.login_history(login_user_id, success_login) VALUES (?, ?)
LoginHistory.logout=UPDATE public.login_history SET logout_time = now() WHERE login_id = ? ORDER BY login_user_id DESC LIMIT 1
LoginHistory.listByLoginUserId=${LoginHistory} login_user_id = ? ORDER BY login_history_id DESC LIMIT ? OFFSET ?
LoginHistory.count=SELECT COUNT(*) from public.login_history WHERE login_user_id = ?
LoginHistory.lastNFailedLogin=SELECT COUNT(*) FROM(select * from login_history where login_user_id = ? ORDER BY login_history_id DESC LIMIT ?) AS last_n_rows WHERE success_login = false
#---------MFA--------
Mfa=SELECT * FROM public.mfa WHERE
Mfa.create=INSERT INTO public.mfa(ogin_user_id, contact_id, mfa_cd, secret) VALUES (?, ?, ?, ?)
Mfa.disable=UPDATE public.mfa SET end_time=CURRENT_TIMESTAMP WHERE login_user_id = ?
#-- Password
Password=SELECT * FROM public.password WHERE 
Password.create=INSERT INTO public.password(login_user_id, secret_key, force_password_change) VALUES (?, ?, ?)
Password.get=${Password} password_id = ?
Password.getByLoginUserId=${Password} login_user_id = ? ORDER BY password_id DESC LIMIT 1
Password.listByLoginUserId=${Password} login_user_id = ?
Password.listLastNRowByLoginUserId=${Password} login_user_id = ? ORDER BY password_id DESC LIMIT ?
Password.PasswordResetAfterNLoginAttempt=SELECT * FROM public.password WHERE login_user_id = ? AND row_created_on > (SELECT row_created_on FROM public.login_history WHERE login_user_id = ? ORDER BY login_user_id DESC LIMIT 1 OFFSET (SELECT COUNT(*) FROM public.login_history WHERE login_user_id = ?) - ?)
#-- Token
Token=SELECT * FROM public.token WHERE
Token.create=INSERT INTO public.token(contact_id, otp, expires_on) VALUES (?, ?, ?)
Token.get=${Token} token_id = ?
Token.getByContactId= ${Token} contact_id = ? AND expires_on > now() ORDER BY token_id DESC LIMIT 1
Token.listByContactId= ${Token} contact_id = ? AND expires_on > now() ORDER BY token_id DESC LIMIT 5
