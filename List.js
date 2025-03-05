//const { type } = require("os");

const addItemBtn = document.getElementById('AddItem');
const popup = document.getElementById('popup');
const overlay = document.getElementById('overlay');
const cancelBtn = document.getElementById('cancelBtn');
const form = document.getElementById('itemForm');
const listContainer = document.getElementById('list-container');
const editform = document.getElementById('itemFormedit')
let editid

document.addEventListener('DOMContentLoaded', function () {
    if (sessionStorage.getItem('userid')) {
        getlist(sessionStorage.getItem('userid'))
    }
    else {
        window.location.href='index.html'
    }
})
const getlist=async (userid)=> {
    data = { userid }
    try {
        const result = await fetch('http://localhost:5000/api/getuserlist', {
            method: 'GET',
            headers: {
                //'Content-Type': 'application/json',
                'custom-Header': userid   // Specify the content type as JSON
            },
        //    body: JSON.stringify(data), // Convert the data to JSON
        });
        if (!result.ok) {
            const data= await result.json()
            if (data.message != "Empty") {
                alert(' failed to extract data')
            }

        }
        const response = await result.json()
        if (response.success) {
            for (let list of response.List) {
                console.log(response.List[0].itemdate.split('T')[0])
                createlist(list.itemName, list.itemImportance, list.itemdate.split('T')[0])
            }
        }
        else if (!response.success && response.Message == 'Empty') {
            pass
        }
    }
    catch (err) {
        console.error('Error:', err);
    }
}
// Show popup
addItemBtn.addEventListener('click', () => {
    popup.style.display = 'block';
    overlay.style.display = 'block';
});

// Hide popup
cancelBtn.addEventListener('click', () => {
    popup.style.display = 'none';
    overlay.style.display = 'none';
    popupedit.style.display = 'none';
});
cancelBtnedit.addEventListener('click',()=>{
     popup.style.display = 'none';
    overlay.style.display = 'none';
    popupedit.style.display = 'none';

})

// Submit form
form.addEventListener('submit', async(e) => {
    e.preventDefault();

    const itemName = document.getElementById('itemName').value;
    const itemDate = document.getElementById('itemDate').value;
    const itemImportance = document.getElementById('itemImportance').value;
    const userid = sessionStorage.getItem('userid')
    const items = itemName
    const imp = itemImportance == 'high' ? 3 : itemImportance=='medium'?2:1
    const date = itemDate
    const status ="added"
    const data = {
        userid,
        items,
        imp,
        date,
        status
    }
    try {
        const response = await fetch('http://localhost:5000/api/updatelist', {
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
        if (result.sucesss) {
            createlist(itemName, itemImportance, itemDate)
        }
    }
    catch (err) {
        console.error('Error:', err);
        alert('Failed to get add. Please try again.');
    }
   
});

function createlist(itemName,itemImportance,itemDate) {
    // Create new item
    const itemDiv = document.createElement('div');
    itemDiv.className = `task-item ${itemImportance}`;
    itemDiv.innerHTML = `
        <h3 id="name_${itemName}">${itemName}</h3>
        <p id='date_${itemName}'>Date: ${itemDate}</p>
        <p id='priority_${itemName}'>Priority: ${itemImportance.charAt(0).toUpperCase() + itemImportance.slice(1)}</p>
        <button id="edit_${itemName}" type="button" onclick="editItem(id)">Edit</button>
        <button id="delete_${itemName}" type="button" onclick="deleteItem(id)">Delete</button>
    `;

    // Add a data attribute to store the item name
    itemDiv.setAttribute('data-item-name', itemName);


    listContainer.appendChild(itemDiv);

    // Clear form and close popup
    form.reset();
    popup.style.display = 'none';
    overlay.style.display = 'none';
}

// Close popup when clicking outside
overlay.addEventListener('click', () => {
    popup.style.display = 'none';
    overlay.style.display = 'none';
    popupedit.style.display='none'
});
function editItem(itemname) {
    itemname = itemname.split('_')[1].trim()
    const itemDiv = document.querySelector(`div[data-item-name='${itemname}']`);
    if (!itemDiv) return;  // Early return if element not found

    // Get elements and extract values
    const nameElement = document.getElementById(`name_${itemname}`);
    const dateElement = document.getElementById(`date_${itemname}`);
    const priorityElement = document.getElementById(`priority_${itemname}`);
    // Extract the values
    const name = nameElement.innerHTML;
    const date = dateElement.innerHTML.split(':')[1].trim();
    const priority = priorityElement.innerHTML.split(':')[1].trim();
    // Update form fields
    document.getElementById('itemNameedit').value = name;
    document.getElementById('itemDateedit').value = date;
    document.getElementById('itemImportanceedit').value = priority[0].toLowerCase() + priority.slice(1);


    console.log(priority)
    // Show popup
    popupedit.style.display = 'block';
    overlay.style.display = 'block';
    editid = itemname
}

async function editbutton(event) {
    event.preventDefault()
    console.log(editid)
    if (editid) {
        const itemName = document.getElementById('itemNameedit').value;
        const itemDate = document.getElementById('itemDateedit').value;
        const itemImportance = document.getElementById('itemImportanceedit').value;
        const itemDiv = document.querySelector(`div[data-item-name='${editid}']`);
        const newname = document.getElementById(`name_${editid}`)
        const newdate = document.getElementById(`date_${editid}`)
        const newprority = document.getElementById(`priority_${editid}`)
        const editbutton = document.getElementById(`edit_${editid}`)
        const deletebutton = document.getElementById(`delete_${editid}`)
        data = {
            userid: sessionStorage.getItem('userid'),
            items: itemName,
            imp: itemImportance == 'high' ? 3 : itemImportance == 'medium' ? 2 : 1,
            date: itemDate,
            olditem: editid,
            status: "edited"
        }
        try {
            const response = await fetch('http://localhost:5000/api/editlist', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json', // Specify the content type as JSON
                },
                body: JSON.stringify(data), // Convert the data to JSON
            });
            if (!response.ok) {
                alert('Failed to edit data')
            }
            else {
                const result = await response.json()
                if (result.message == "Update successful") {
                           
                    itemDiv.className = `task-item ${itemImportance}`
                    document.getElementById(`name_${editid}`).innerHTML = itemName
                    document.getElementById(`date_${editid}`).innerHTML = `Date: ${itemDate}`
                    document.getElementById(`priority_${editid}`).innerHTML = `Priority: ${itemImportance.charAt(0).toUpperCase() + itemImportance.slice(1)}`
                    newname.id = `name_${itemName}`
                    newdate.id = `date_${itemName}`
                    newprority.id = `priority_${itemName}`
                    editbutton.id = `edit_${itemName}`
                    deletebutton.id = `delete_${itemName}`
                    itemDiv.setAttribute('data-item-name', itemName)
                }
                else {
                    alert(result.message)
                }
            }
        } catch (err) {
            console.log(err)
           alert('failed to acess the api')
        }
        
        } 

    
    popupedit.style.display = 'none';
    overlay.style.display = 'none';
}
async function deleteItem(itemname)
{
    itemname = itemname.split('_')[1].trim()
    const itemDiv = document.querySelector(`div[data-item-name='${itemname}']`);
    if (itemDiv) {
        const data = {
            userid: sessionStorage.getItem('userid'),
            items: itemname,
            status: "Deleted"
        }
        try {
            const response = await fetch('http://localhost:5000/api/delete', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json', // Specify the content type as JSON
                },
                body: JSON.stringify(data), // Convert the data to JSON
            });
            if (!response.ok) {
                alert('Failed to delete data')
            }
            else {
                const result = await response.json()
                if (result.message == "Deleted Sucessfully") {
                    itemDiv.remove()

                }
                else {
                    alert("no record found of that user")
                }
            }

        } catch (err) {
            console.log(err)
            alert("Interal server error")
        }
    }
}