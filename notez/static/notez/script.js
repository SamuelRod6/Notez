document.addEventListener('DOMContentLoaded', () => {
    /* Change the active link */
    const page = document.getElementById('page').name.trim();
    const notesButton = document.getElementById('notes-button');
    const sharedButton = document.getElementById('shared-button');
    if (page == 'shared') {
        notesButton.className = 'nav-link';
        sharedButton.className = 'nav-link active';
    }
    
    /* Get the shared users of every note */
    const cards = document.getElementsByName('card');
    cards.forEach(card => {
        const noteID = card.querySelector('div[class="card-body"]').id.replace('note-', '').trim();
        getSharedWith(noteID).then(response => card.querySelector('div[name="shares"]').innerHTML = response);
    });

});


function editNote(noteID) {
    /* Function to edit the note content using AJAX */

    /* Select the requested note */
    const note = document.getElementById(`note-${noteID}`)
    const page = document.getElementById('page').name.trim();

    /* Hides edit button */
    const editButton = note.querySelector('button[name="edit-button"]');
    editButton.disabled = true;
    
    /* Take the current title and content values and hide the text tags */
    const title = note.querySelector('h5[name="title"]').innerHTML.trim();
    note.querySelector('h5[name="title"]').style.display = 'none';
    const content = note.querySelector('p[name="content"]').innerHTML.trim();
    note.querySelector('p[name="content"]').style.display = 'none';
    const shared = note.querySelector('div[name="shares"]').innerHTML.trim();
    
    /* Select all the edit windows */
    const editTitleWindow = note.querySelector('div[name="edit-title-window"]');
    const editContentWindow = note.querySelector('div[name="edit-content-window"]');
    const editSharedWindow = note.querySelector('div[name="edit-shared-window"]');
    const editButtons = note.querySelector('div[name="edit-buttons-window"]');
    
    /* Creates all the edit text boxes with the current text preloaded */
    const titleTextBox = document.createElement('input');
    titleTextBox.className = 'form-control';
    titleTextBox.placeholder = 'Edit the title of the note';
    titleTextBox.value = title;
    editTitleWindow.append(titleTextBox);

    const contentTextBox = document.createElement('textarea');
    contentTextBox.className = 'form-control';
    contentTextBox.rows = '5';
    contentTextBox.placeholder = 'Edit the content of the note';
    contentTextBox.value = content;
    editContentWindow.append(contentTextBox);
    
    /* If the page is 'index' create a window to edit shared people */
    const sharedTextBox = document.createElement('input');
    if (page == 'index') {
        note.querySelector('div[name="shares"]').style.display = 'none';
        sharedTextBox.className = 'form-control';
        sharedTextBox.placeholder = 'Edit the people you share the list with';
        if (shared != '') {
            /* Trim a leave only the usernames in a comma separated single string */
            sharedTextBox.value = shared.replace('Shared with:', '').split(',').map(item => item.trim()).join(', ').trim();
        }
        editSharedWindow.append(sharedTextBox);
    }
    
    /* Creates a save button and fetch to the database for saving changes */
    const saveButton = document.createElement('button');
    saveButton.className = 'btn btn-sm btn-outline-success mb-2';
    saveButton.innerHTML = 'Save';
    editButtons.append(saveButton);
    saveButton.addEventListener('click', () => {
        editButton.disabled = false;
        note.querySelector('h5[name="title"]').style.display = 'block';
        note.querySelector('p[name="content"]').style.display = 'block';
        editTitleWindow.innerHTML = '';
        editContentWindow.innerHTML = '';
        editButtons.innerHTML = '';
        note.querySelector('h5[name="title"]').innerHTML = titleTextBox.value;
        if (titleTextBox.value.trim() == '') {
            note.querySelector('h5[name="title"]').innerHTML = title;
        }
        note.querySelector('p[name="content"]').innerHTML = contentTextBox.value;
        if (contentTextBox.value.trim() == '') {
            note.querySelector('p[name="content"]').innerHTML = content;
        }
        if (page == 'index') {
            editSharedWindow.innerHTML = '';
            setTimeout(() => {
                getSharedWith(noteID).then(response => note.querySelector('div[name="shares"]').innerHTML = response);
                note.querySelector('div[name="shares"]').style.display = 'block';
            }, 100);
        }
                
        if (page == 'index') {
            fetch(`/edit/${noteID}`, {
                method: 'post',
                body: JSON.stringify({
                    title: titleTextBox.value,
                    content: contentTextBox.value,
                    shared: sharedTextBox.value
                }) 
            })
            .then(response => response.json())
            .then(result => {
                console.log(result);
            });
        }
        else {
            fetch(`/edit/${noteID}`, {
                method: 'post',
                body: JSON.stringify({
                    title: titleTextBox.value,
                    content: contentTextBox.value,
                })
            })
            .then(response => response.json())
            .then(result => {
                console.log(result);
            });
        }
    })
    
    /* Creates a cancel button that exits the edition */
    const cancelButton = document.createElement('button');
    cancelButton.className = 'btn btn-sm btn-default mb-2';
    cancelButton.innerHTML = 'Cancel';
    editButtons.append(cancelButton);
    cancelButton.addEventListener('click', () => {
        editButton.disabled = false;
        note.querySelector('h5[name="title"]').style.display = 'block'
        note.querySelector('p[name="content"]').style.display = 'block';
        editTitleWindow.innerHTML = '';
        editContentWindow.innerHTML = '';
        editButtons.innerHTML = '';
        if (page == 'index') {
            note.querySelector('div[name="shares"]').style.display = 'block';
            editSharedWindow.innerHTML = '';
        }
    });
}


function getSharedWith(noteID) {
    /* Function to get a string with the usernames of the people who the requested note is shared with */
    return fetch(`/get_shared_with/${noteID}`)
        .then(response => response.json())
        .then(result => {
            if (result.sharedWith.length > 0) {
                return `Shared with: ${result.sharedWith.join(', ')}`;
            }
            else {
                return '';
            }
        });
}
