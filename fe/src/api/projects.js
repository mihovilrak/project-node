// api/projects.js

const getProjects = async () => {
    try {
        const response = await fetch('localhost:5000/api/projects');
        const data = await response.json();
        return data;
    } catch (error) {
        throw error;
    }
  };
  
  export { getProjects };
  