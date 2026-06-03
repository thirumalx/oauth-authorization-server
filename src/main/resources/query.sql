GenericCd.listByTableName=SELECT * FROM lookup.{TABLE_NAME}_cd AS c LEFT JOIN lookup.{TABLE_NAME}_locale AS l ON l.{TABLE_NAME}_cd = c.{TABLE_NAME}_cd WHERE l.locale_cd = ? AND l.end_time = 'infinity'
GenericCodeCd.getLocalCd=SELECT locale_cd FROM lookup.locale_cd WHERE code=? AND end_time = 'infinity'
#-- Contact
Contact=SELECT * FROM public.contact WHERE
Contact.create=INSERT INTO public.contact(login_user_id, contact_cd, login_id) VALUES (?, ?, ?)
Contact.verify=UPDATE public.contact SET verified_on = now() WHERE contact_id = ?
Contact.get=${Contact} contact_id = ?
Contact.getByLoginUserId=${Contact} login_user_id = ? ORDER BY contact_id DESC LIMIT 1
Contact.listByLoginUserId=${Contact} login_user_id = ? AND end_time = 'infinity'
Contact.listByLoginId=${Contact} login_id = ? AND end_time = 'infinity'
Contact.listInLoginId=${Contact} login_id IN (?) AND end_time = 'infinity'
Contact.delete=UPDATE public.contact SET end_time = now() WHERE contact_id = ?
Contact.update=UPDATE public.contact SET login_id = ?, verified_on = NULL WHERE contact_id = ?
#-- Login User
LoginUser = SELECT lu.*, ll.description AS language_locale FROM public.login_user lu LEFT JOIN lookup.language_locale ll ON ll.language_cd = lu.language_cd AND ll.locale_cd = 1 AND ll.end_time = 'infinity'::timestamp
LoginUser.create=INSERT INTO public.login_user(language_cd, login_uuid, date_of_birth, individual) VALUES (?, ?, ?, ?)
LoginUser.get=${LoginUser} WHERE lu.login_user_id = ?
LoginUser.getByUuid=${LoginUser} WHERE lu.login_uuid = ?
LoginUser.list=${LoginUser} LIMIT ? OFFSET ?
LoginUser.listIndividual=${LoginUser} WHERE lu.individual IS TRUE LIMIT ? OFFSET ?
LoginUser.listOrg=${LoginUser} WHERE lu.individual IS FALSE LIMIT ? OFFSET ?
LoginUser.count=SELECT COUNT(*) FROM public.login_user
LoginUser.countIndividual=SELECT COUNT(*) FROM public.login_user WHERE individual IS TRUE
LoginUser.countOrg=SELECT COUNT(*) FROM public.login_user WHERE individual IS FALSE
LoginUser.update=UPDATE public.login_user SET date_of_birth = ?, individual = ?, language_cd = ? WHERE login_user_id = ?
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
LoginHistory.logout=UPDATE public.login_history SET logout_time = now() WHERE login_history_id = (SELECT login_history_id FROM public.login_history WHERE login_user_id = ? ORDER BY login_history_id DESC LIMIT 1)
LoginHistory.listByLoginUserId=${LoginHistory} login_user_id = ? ORDER BY login_history_id DESC LIMIT ? OFFSET ?
LoginHistory.count=SELECT COUNT(*) from public.login_history WHERE login_user_id = ?
LoginHistory.lastNFailedLogin=SELECT COUNT(*) FROM(select * from login_history where login_user_id = ? ORDER BY login_history_id DESC LIMIT ?) AS last_n_rows WHERE success_login = false
LoginHistory.lastSuccessfulLogin=SELECT * FROM public.login_history WHERE login_user_id = ? ORDER BY login_history_id DESC LIMIT 1
#---------MFA--------
Mfa=SELECT * FROM public.mfa WHERE
Mfa.create=INSERT INTO public.mfa(login_user_id, contact_id, mfa_cd, secret, verified, primary_mfa) VALUES (?, ?, ?, ?, ?, ?)
Mfa.get=${Mfa} mfa_id = ?
Mfa.listByLoginUserId=${Mfa} login_user_id = ? AND end_time = 'infinity'
Mfa.update=UPDATE public.mfa SET contact_id = ?, mfa_cd = ?, secret = ?, verified = ?, primary_mfa = ?, row_updated_on = CURRENT_TIMESTAMP WHERE mfa_id = ? AND login_user_id = ?
Mfa.delete=UPDATE public.mfa SET end_time = CURRENT_TIMESTAMP WHERE mfa_id = ? AND login_user_id = ?
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
#---------Allowed IP--------
AllowedIp.create=INSERT INTO public.allowed_ip(login_user_id, id, ip_range, start_time, end_time) VALUES (?, ?, ?::cidr, COALESCE(?, CURRENT_TIMESTAMP), COALESCE(?, 'infinity'::timestamp))
AllowedIp.get=SELECT a.allowed_ip_id, a.login_user_id, a.id, a.ip_range::text AS ip_range, a.start_time, a.end_time, a.created_at, c.client_name, c.client_id FROM public.allowed_ip a LEFT JOIN public.oauth2_registered_client c ON c.id = a.id WHERE a.allowed_ip_id = ?
AllowedIp.listByLoginUserId=SELECT a.allowed_ip_id, a.login_user_id, a.id, a.ip_range::text AS ip_range, a.start_time, a.end_time, a.created_at, c.client_name, c.client_id FROM public.allowed_ip a LEFT JOIN public.oauth2_registered_client c ON c.id = a.id WHERE a.login_user_id = ? AND a.end_time = 'infinity'::timestamp ORDER BY a.allowed_ip_id DESC
AllowedIp.update=UPDATE public.allowed_ip SET id = ?, ip_range = ?::cidr, start_time = ?, end_time = ? WHERE allowed_ip_id = ? AND login_user_id = ?
AllowedIp.delete=UPDATE public.allowed_ip SET end_time = CURRENT_TIMESTAMP WHERE allowed_ip_id = ? AND login_user_id = ?

#---------Address--------
Address.create=INSERT INTO public.address(login_user_id, address_cd, address_usage_cd, country_cd, state_cd, address_line_1, address_line_2, city_town, postal_code, district) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
Address.get=SELECT a.*, cl.description AS country_description, sl.description AS state_description, al.description AS address_type_description, aul.description AS address_usage_description FROM public.address a LEFT JOIN lookup.country_locale cl ON cl.country_cd = a.country_cd AND cl.locale_cd = 1 AND cl.end_time = 'infinity'::timestamp LEFT JOIN lookup.state_locale sl ON sl.state_cd = a.state_cd AND sl.locale_cd = 1 AND sl.end_time = 'infinity'::timestamp LEFT JOIN lookup.address_locale al ON al.address_cd = a.address_cd AND al.locale_cd = 1 AND al.end_time = 'infinity'::timestamp LEFT JOIN lookup.address_usage_locale aul ON aul.address_usage_cd = a.address_usage_cd AND aul.locale_cd = 1 AND aul.end_time = 'infinity'::timestamp WHERE a.address_id = ?
Address.listByLoginUserId=SELECT a.*, cl.description AS country_description, sl.description AS state_description, al.description AS address_type_description, aul.description AS address_usage_description FROM public.address a LEFT JOIN lookup.country_locale cl ON cl.country_cd = a.country_cd AND cl.locale_cd = 1 AND cl.end_time = 'infinity'::timestamp LEFT JOIN lookup.state_locale sl ON sl.state_cd = a.state_cd AND sl.locale_cd = 1 AND sl.end_time = 'infinity'::timestamp LEFT JOIN lookup.address_locale al ON al.address_cd = a.address_cd AND al.locale_cd = 1 AND al.end_time = 'infinity'::timestamp LEFT JOIN lookup.address_usage_locale aul ON aul.address_usage_cd = a.address_usage_cd AND aul.locale_cd = 1 AND aul.end_time = 'infinity'::timestamp WHERE a.login_user_id = ? AND a.end_time = 'infinity'::timestamp ORDER BY a.address_id DESC
Address.update=UPDATE public.address SET address_cd = ?, address_usage_cd = ?, country_cd = ?, state_cd = ?, address_line_1 = ?, address_line_2 = ?, city_town = ?, postal_code = ?, district = ? WHERE address_id = ? AND login_user_id = ?
Address.delete=UPDATE public.address SET end_time = CURRENT_TIMESTAMP WHERE address_id = ? AND login_user_id = ?
