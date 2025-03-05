//const btn = document.getElementsByClassName('class1');
//const btn1 = document.querySelector('.class1')
//console.log(btn,btn1)
//btn1.addEventListener('click', () => {
//    const text = "hellow how are you"
//    const updatetext = document.querySelector('.update')
//    updatetext.innerHTML = text
//})
function redirect() {
    window.location.href = "register.html";
}

document.querySelector('.register-link').onclick = redirect;
async function checklogin(event) {
    event.preventDefault(); // Prevent form submission before fetch completes

    try {
        const name = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        if (name.length == 0 || password.length == 0) {
            document.getElementById('error').innerHTML = '*please enter both name and password';
            return;
        }

        const data = {
            name,
            password
        };

        const response = await fetch('http://localhost:5000/api/checklogin', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json', // Specify the content type as JSON
            },
            body: JSON.stringify(data), // Convert the data to JSON
        });

        if (!response.ok) {
            throw new Error('Failed to get registered ');
        }

        // Parse the response JSON
        const result = await response.json();

        if (result.success == true) {
            sessionStorage.setItem('userid', result.user.userid)
            window.location.href='List.html'

        } else {
            alert('Invalid login id and password');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Failed to get registered . Please try again.');
    }
}

document.getElementById('submit').onclick = checklogin;

