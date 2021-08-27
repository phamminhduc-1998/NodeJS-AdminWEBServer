/** Cài đặt, cấu hình framework express và template express-handlebars*/
let express = require('express');
var expressHbs = require('express-handlebars');
var app = express();
app.engine('handlebars', expressHbs());
app.set('view engine', 'handlebars');

/**Connect mongoDB thông qua thư viên mongoose */
let mongoose = require('mongoose');
mongoose.connect('mongodb+srv://Phamminhduc98:1998@cluster0.n0dkx.mongodb.net/MonggoDBASS?retryWrites=true&w=majority', {
    useNewUrlParser: true,
    useUnifiedTopology: true,

}).then(function (conn) {
    console.log("Connect MongoDB thanh cong");
});

/**Truy xuất dữ liệu trong From */
let bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

/**Cung cấp các tệp tĩnh trong Express*/
app.use(express.static('css'));
app.use(express.static('public'));

/**Routing*/
app.get('/', function (req, res) {
    res.render('login');
});
app.get('/register', function (req, res) {
    res.render('register');
});

/**
 * Khai báo đường dẫn và cấu hình model cho mongooe
*/
let adminSchema = require('./model/adminSchema');
let Admin = mongoose.model('UserAdmin', adminSchema);

/**
 * Check From Login
 * Lấy data từ MonggoDB và so sánh với data trong from
 */
app.post('/admin/login', async function (req, res) {
    let admin = await Admin.find({}).lean();
    var email = req.body.email;
    var password = req.body.password;

    for (var i = 0; i < admin.length; i++) {
        if (admin[i].EmailAddress == email && admin[i].Password == password) {
            console.log("email : " + admin[i].EmailAddress);
            console.log("password : " + admin[i].Password);
            res.redirect('/getAllPro');
            return;
        }
    }
    res.redirect('/');
});

//Trả file json Admin
app.get('/getJsonAdmin', async (req, res) => {
    let admin = await Admin.find({}).lean();
    res.send(admin);
});

/**
 * Thêm Admin
 * Lấy data trên from và đấy lên mongoSB
 */
app.post('/admin/register', async function (req, res) {
    var name = req.body.name;
    var email = req.body.email;
    var password = req.body.password;
    var password2 = req.body.password2;
    const admin = new Admin({
        Username: name,
        EmailAddress: email,
        Password: password,
        ConfirmPassword: password2,
    });
    console.log(admin);
    try {
        await admin.save();
        res.redirect('/');
    } catch (e) {
        res.redirect('/register');
    }
});


/**
 * Khai báo đường dẫn và cấu hình model cho mongooe
*/
let productSchema = require('./model/productSchema');
let product = mongoose.model('SanPham', productSchema);

/**Routing*/
app.get('/addProducts', function (req, res) {
    res.render('addProducts');
});

/**
 * Tìm kiếm data trong mongoDB và hiển thị ra HTML
 */
app.get('/getAllPro', async (req, res) => {
    let products = await product.find({}).lean();
    try {
        res.render('index', { arr: products })
    } catch (e) {
        res.send('co loi xay ra: ' + e.message)
    }
});

//Trả file json products
app.get('/getJsonProducts', async (req, res) => {
    let products = await product.find({}).lean();
    res.send(products);
});

/**
 * Thư viện multer
 * cb: Kiểm tra xem file có thể lưu trữ hay k hoặc thay đổi đường dẫn, tên file
 * Upload File
 */
var multer = require('multer');
let multerConfig = multer.diskStorage({
    destination: function (request, file, cb) {
        cb(null, './public')
    },
    filename: function (request, file, cb) {

        /**Thay đổi tên file ảnh*/
        let math = ["image/jpeg"];
        if (math.indexOf(file.mimetype) === -1) {
            let errorMess = `The file <strong>${file.originalname}</strong> is invalid. Only allowed to upload image jpg.`;
            return cb(errorMess, null);
        }
        cb(null, file.fieldname + '_' + file.originalname + '_' + Date.now() + '.JPEG')
    }

});
let uploadManyFiles = multer({
    storage: multerConfig, limits: {
        fileSize: 1 * 1024 * 1024,
        files: 2,
    }
}).single("avatar");



/**
 * Thêm sản phẩm
 * Lấy data trên from và đẩy lên MongoDB 
 * */
app.post('/addProducts', async (req, res) => {
    uploadManyFiles(req, res, async function () {
        var name1 = req.body.name;
        var type1 = req.body.type;
        var price1 = req.body.price;
        var image = req.file.path.split('\\')[1];
        const products = new product({
            Type: type1,
            Name: name1,
            Price: price1,
            Img: image
        });
        await products.save(function (err, product) {
            if (err) {
                res.render('addProducts')
            } else {
                res.redirect('/getAllPro')
            }
        })
    })
});


/**
 * Sửa chi tiết sản phẩm
 * lấy data trên mongoDB về và hiển thị lên from 
 * Sửa from
 */
app.get('/editProduct/:id', async (req, res) => {
    let products = await product.find({}).lean();
    console.log('id:' + req.params.id);

    for (var i = 0; i < products.length; i++) {
        console.log("id products : " + products[i]._id);
        if (products[i]._id == req.params.id) {
            res.render('updateProducts', {
                id: products[i]._id,
                name: products[i].Name,
                type: products[i].Type,
                price: products[i].Price,

                type2: products[i].Type
            });
            console.log('editProduct/:id:' + products[i].Type);
            return;
        }
    }
});

/**
 * Sau khi sửa from thì lấy lại data trên from
 * đẩy data lên mongoDB
 */
app.post('/editProduct/updateProduct', async (req, res) => {
    uploadManyFiles(req, res, async function () {
        var id1 = req.body.id;
        var name1 = req.body.name;
        var type1 = req.body.type;
        var price1 = req.body.price;
        console.log('name1: ' + name1);
        console.log('file: ' + req.file.path);
        console.log('price: ' + price1);
        console.log('type: ' + type1);

        var image = req.file.path.split('\\')[1];
        try {
            await product.findByIdAndUpdate(id1, {
                Name: name1,
                Type: type1,
                Price: price1,
                Img: image

            });
            res.redirect('/getAllPro')
        } catch (e) {
            res.send('co loi xay ra: ' + e.message)
        }
    })
});


/**
 * Xóa sản phẩm 
 * Lấy id của sản phẩm và xóa sản phẩm theo ID
 */
app.get('/deleteProduct/:id', async (req, res) => {
    await product.findByIdAndDelete(req.params.id + '');
    console.log('id:' + req.params.id);
    res.redirect('/getAllPro')
})


/**Admin
 * 
 */
app.get('/addAdmin', (req, res) => {
    res.redirect('/register');
});

/**
 * Hiển thị tất cả danh sách Admin
 * Tìm kiếm data trên mongoSB và hiển thị ra HTML
 */
app.get('/getAllAdmin', async (req, res) => {
    let adminAll = await Admin.find({}).lean();
    try {
        res.render('getAllAdmin', { arr: adminAll })
    } catch (e) {
        res.send('co loi xay ra: ' + e.message)
    }
});

/**
 * Tìm và Xóa Admin theo ID và update MongoDB
 */
app.get('/deleteAdmin/:id', async (req, res) => {
    await Admin.findByIdAndDelete(req.params.id + '');
    console.log('id:' + req.params.id);
    res.redirect('/getAllAdmin')
});

/**
 * Sửa thông tin Admin
 * Tìm kiếm thông tin Admin trên MongoDB theo ID
 * Hiển thị thông tin Admin theo ID lên from
 */
app.get('/editAdmin/:id', async (req, res) => {
    let admin = await Admin.find({}).lean();
    console.log('id:' + req.params.id);

    for (var i = 0; i < admin.length; i++) {
        console.log("id admin : " + admin[i]._id);
        if (admin[i]._id == req.params.id) {
            res.render('updateAdmin', {
                id: admin[i]._id,
                name: admin[i].Username,
                email: admin[i].EmailAddress,
                pass: admin[i].Password,
                comfimPass: admin[i].ConfirmPassword,

            })
            return;
        }
    }

});


/**
 * Sửa thông tin trên From 
 * Lấy thông tin trên from 
 * Tìm và Update thông tin theo ID
 */
app.post('/editAdmin/updateAdmin', async (req, res) => {
    var id1 = req.body.id;
    var name1 = req.body.name;
    var email1 = req.body.email;
    var pass1 = req.body.pass;
    var pass11 = req.body.comfimPass;
    try {
        await Admin.findByIdAndUpdate(id1, {
            Username: name1,
            EmailAddress: email1,
            Password: pass1,
            ConfirmPassword: pass11,


        })
        res.redirect('/getAllAdmin')
    } catch (e) {
        res.send('co loi xay ra: ' + e.message)
    }
});


/**
 * User
 */
/**
 * Khai báo đường dẫn và cấu hình model cho mongoose
*/
let userSchema = require('./model/userSchema');
let User = mongoose.model('User', userSchema);


app.get('/addUser', async (req, res) => {
    res.render('addUser')
})

/**
 * Lay data trong from 
 * Luu data len mongoDB
 */
app.post('/addUser', async (req, res) => {
    console.log('them user app')
    var name1 = req.body.name;
    var user1 = req.body.user;
    var pass1 = req.body.pass;
    var phone1 = req.body.phone;
    var adress1 = req.body.adress;
    const user = new User({
        Name: name1,
        User: user1,
        Pass: pass1,
        Phone: phone1,
        Adress: adress1
    });
    try {
        await user.save();
        console.log(user)
        res.redirect('/addUser')
    } catch (e) {
        console.log('them user that bai: ' + e.message);

    }

});

/**
 * hien thi len HTML
 */
app.get('/getUser', async (req, res) => {
    let user = await User.find({}).lean();
    try {
        res.render('getUser', { arr: user })
    } catch (e) {
        res.send('co loi xay ra: ' + e.message)
    }
});


//Trả file json User
app.get('/getJsonUser', async (req, res) => {
    let user = await User.find({}).lean();
    res.send(user);
});

/**
 * Sửa thông tin User
 * Tìm kiếm thông tin User trên MongoDB theo ID
 * Hiển thị thông tin User theo ID lên from
 */
app.get('/editUser/:id', async (req, res) => {
    let user = await User.find({}).lean();
    console.log('id:' + req.params.id);

    for (var i = 0; i < user.length; i++) {
        console.log("id user : " + user[i]._id);
        if (user[i]._id == req.params.id) {
            res.render('updateUser', {
                id: user[i]._id,
                name: user[i].Name,
                user: user[i].User,
                pass: user[i].Pass,
                phone: user[i].Phone,
                adress: user[i].Adress,

            })
            return;
        }
    }

});


/**
 * Sửa thông tin trên From 
 * Lấy thông tin trên from 
 * Tìm và Update thông tin theo ID
 */
app.post('/editUser/updateUser', async (req, res) => {

    var id1 = req.body.Id;
    var name1 = req.body.Name;
    var user1 = req.body.User;
    var pass1 = req.body.Pass;
    var phone1 = req.body.Phone;
    var adress1 = req.body.Adress;

    try {
        await User.findByIdAndUpdate(id1, {
            Name: name1,
            User: user1,
            Pass: pass1,
            Phone: phone1,
            Adress: adress1
        })
        res.redirect('/getUser')

    } catch (e) {
        console.log('update that bai user: ' + user1)
    }
});


/**
 * Tìm và Xóa User theo ID và update MongoDB
 */
app.get('/deleteUser/:id', async (req, res) => {
    await User.findByIdAndDelete(req.params.id + '');
    console.log('id:' + req.params.id);
    res.redirect('/getUser')
});


//Bill
app.get('/addBill', async (req, res) => {
    res.render('addBill')
});

/**
 * Khai báo đường dẫn và cấu hình model cho mongooe
*/
let billSchema = require('./model/billSchema');
let bill = mongoose.model('bill', billSchema);

/**
 * Thêm bill
 * Lấy data trên from và đẩy lên MongoDB 
 * */
app.post('/addBills', async (req, res) => {
    uploadManyFiles(req, res, async function () {
        var name1 = req.body.name;
        var user1 = req.body.user;
        var price1 = req.body.price;
        
        const bills = new bill({
            NameProducts: name1,
            User: user1,
            Price: price1,
        });
        await bills.save(function (err, product) {
            if (err) {
                res.render('addBill')
            } else {
                res.redirect('/getAllPro')
            }
        })
    })
});



/**
 * Hiển thị tất cả danh sách bill
 * Tìm kiếm data trên mongoSB và hiển thị ra HTML
 */
app.get('/getAllBill', async (req, res) => {
    let billAll = await bill.find({}).lean();
    try {
        res.render('getAllBill', { arr: billAll })
    } catch (e) {
        res.send('co loi xay ra: ' + e.message)
    }
});

/**
 * Tìm và Xóa Bill theo ID và update MongoDB
 */
app.get('/deleteBill/:id', async (req, res) => {
    await bill.findByIdAndDelete(req.params.id + '');
    console.log('id:' + req.params.id);
    res.redirect('/getAllBill')
});


/**chạy lên localhost với post 3000 */
// app.listen(process.env.PORT || '3000');

app.listen(process.env.PORT ,function(){
    
});
