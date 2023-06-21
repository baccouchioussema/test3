module.exports.signUpErrors = (err) => {
    let errors = { pseudo: '', email: '', password:''}

    if (err.message.includes('pseudo'))
    errors.pseudo = "Pseudo incorrect ou deja pris";

    if ( err.message.includes('email'))
    errors.email = 'Email incorrect' ; 

if ( err.message.includes('password'))
errors.password = ' le mot de passe doit faire 6 caracteres minium';

if (err.code === 11000 && Object.keys(err.keysValue)[0].includes("pseudo"))
errors.pseudo = 'cet pseudo est deja pris' ; 

if (err.code === 11000 && Object.keys(err.keysValue)[0].includes("email"))
errors.email = 'cet email est deja enregistre' ; 

    return errors;
}


module.exports.signInErrors = (err) => {
    let errors = { email: '', password: ''}

    if (err.message.includes("emaill"))
     errors.email = "Email inconnu"

     if (err.message.includes("password"))
     errors.password = "Le mot de passe ne correspond pas"

    return errors ; 
}

module.exports.uploadErrors = (err) => {
    console.log("test 007")
    let errors = { format: '' , maxSize: ""};
    if (err.message.includes('invalid file'))
    errors.format  = "format incompatabile";

    if (err.message.includes('max size'))
    errors.maxSize = "le fichier dépasse 500ko";
 
    return errors
}