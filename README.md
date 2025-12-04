# ibra To-Do

A modern, glassmorphism to-do list built with **HTML, CSS, and JavaScript**.

- Dark / light theme with smooth transitions
- Glass / liquid-style UI with soft gradients and shadows
- Time-based greeting (Good morning / afternoon / evening, ibra)
- Add, complete, and delete tasks
- Filters: **All**, **Active**, **Completed**
- Local storage so your tasks and theme persist

## Getting started

1. Clone or download this repository.
2. Open the project folder.
3. Open `index.html` in your browser (double-click it or use a live server).

No build step or backend is required.

## Usage

- **Add a task**: type in the input field and press **Add** or hit **Enter**.
- **Mark complete**: click anywhere on the task row (or the left circle) in **All** or **Active**.
- **View Active tasks**: click **Active**.
- **View Completed tasks**: click **Completed**.
- **Delete completed tasks**:
  - In **Completed**, click the task (or the `×`) to delete it.
  - A small toast message will appear confirming deletion.
- **Clear completed**: click the **Clear completed** button in the footer to remove all completed tasks at once.
- **Theme toggle**: click the sun/moon button in the header to switch between dark and light mode.

## Project structure

- `index.html` – main page markup
- `style.css` – styling, glassmorphism, themes, animations
- `script.js` – app logic (tasks, filters, localStorage, theme, greeting)

## License

This project is for personal/portfolio use. Feel free to fork it and customize the design for your own projects.
