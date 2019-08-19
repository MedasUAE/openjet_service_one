module.exports = {
    name: "openjetAPI",
    env: process.env.NODE_ENV || "development",
    port: process.env.PORT || 3000,
    db:{
        host: process.env.DB_HOST || '192.168.0.20',
        user: process.env.DB_USER || 'root',
        password : process.env.DB_PSW || 'medteam2013',
        port : process.env.DB_PORT || 3306, //port mysql
        database:process.env.DB_NAME || 'eclinic_korehub_p1'
    }
}