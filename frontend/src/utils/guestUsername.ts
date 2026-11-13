
export function getGuestUsername() {
	let username = sessionStorage.getItem("guestUsername");

	if (!username) {
		username = `Guest ${Math.floor(1000 + Math.random() * 9000)}`;
		sessionStorage.setItem("guestUsername", username);
	}

	return username;
}