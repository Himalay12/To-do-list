
const today = () => {
    const today = new Date();
    const options = { weekday: 'long', month: 'long', day: 'numeric' };
    // const currentDay = today.getDay();
    // const day = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thrusday", "Friday", "Saturday"];
    
    const day = today.toLocaleDateString("en-US", options);
    return day;
};

module.exports = today;