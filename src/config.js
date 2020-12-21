const baseURL = "https://ceebo.com/api/v1/";

export default {
    // user management api
    getProfileURL: baseURL + 'user/profile',
    checkEmailURL: baseURL + "user/check_email",
    loginURL: baseURL + "user/login",
    logoutURL: baseURL + "user/logout",
    forgotPasswordURL: baseURL + "user/forgot_password",
    signupURL: baseURL + "user/signup",
    favoriteURL: baseURL + 'user/favorites',
    oAuthURL: baseURL + "user/oauth",
    updateAvatarURL: baseURL + "user/update_avatar",
    updateAccountURL: baseURL + "user/update_account",

    // cart management api
    getCartURL: baseURL + "cart/items",
    addToCartURL: baseURL + "cart/add_item",
    updateToCartURL: baseURL + "cart/update_item",
    checkoutURL: baseURL + "cart/checkout",
    updateQtyURL: baseURL + "cart/update_qty",
    deleteCartItemURL: baseURL + "cart/delete_item",
    checkAddressURL: baseURL + "cart/check_address",
    clearCartURL: baseURL + "cart/clear_cart",

    // restaurants list in the home screen
    exploreTabURL: baseURL + "listing/explore",
    collectionURL: baseURL + "listing/collections",
    viewURL: baseURL + "listing/view",
    reviewURL: baseURL + "listing/reviews",
    categoriesURL: baseURL + "listing/categories",
    dietsURL: baseURL + "listing/diets",
    searchURL: baseURL + "listing/search",
    addFavoriteURL: baseURL + "user/add_favorite",
    geoHashURL: baseURL + "restaurants",
    productItemURL: baseURL + "listing/items",

    // order 
    ordersURL: baseURL + "user/orders",
    createReviewofOrderURL: baseURL + "user/create_review",
    orderStatusURL: baseURL + "user/order_status",
    addOrderReviewURL: baseURL + "user/create_review",
    cancelOrderURL: baseURL + "user/cancel_order",

    // card
    deleteCardURL: baseURL + "user/delete_card",
    createCardURL: baseURL + "user/create_card",
    defaultCardURL: baseURL + "user/default_card",
    allCardsURL: baseURL + "user/payment_methods",

    // address
    createAddressURL: baseURL + "user/create_address",
    updateAddressURL: baseURL + "user/update_address",
    deleteAddressURL: baseURL + "user/delete_address",
    defaultAddressURL: baseURL + "user/default_address",
    getAddressesURL: baseURL + "user/get_addresses",

    // help
    helpInteractionURL: baseURL + "help/order_interactions"
}

export const STRIPE_PUBLIC_TEST_KEY = 'pk_test_cJzcNynu2FfTD9cbnjYx71Uq00PrxLrygl';
export const GOOGLE_MAP_API_KEY = 'AIzaSyDml6rqKwjgQgPomyAhC-WxVt4aLodlraU'