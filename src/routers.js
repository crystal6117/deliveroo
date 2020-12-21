import { createAppContainer, createSwitchNavigator } from 'react-navigation'
import { createStackNavigator } from 'react-navigation-stack'

import AuthLoading from './screens/splash';
import FirstScreen from './screens/first';
import SigninScreen from './screens/signin';
import SigninEmailScreen from './screens/signin/signinEmail';
import ForgotPasswordScreen from './screens/signin/forgotpassword';
import SignupScreen from './screens/signin/signup';
import LocationAddressScreen from './screens/address/locationaddress';
import ManualAddressScreen from './screens/address/manualaddress';
import NewAddressScreen from './screens/newaddress';
import HomeScreen from './screens/home';
import ActualPositionScreen from './screens/actualposition';
import SearchFilterScreen from './screens/searchfilter';
import RestaurantScreen from './screens/restaurant';
import RestaurantInfoScreen from './screens/restaurantinfo';
import ProductDetailScreen from './screens/productdetail';
import ProductNoteScreen from './screens/productnote';
import RestaurantNoteScreen from './screens/restaurantnote';
import AccountScreen from './screens/account';
import PaymentMethodScreen from './screens/paymentmethod';
import MyAddressScreen from './screens/myaddresses';
import MyOrderScreen from './screens/myorders';
import ProfileScreen from './screens/profile';
import AboutScreen from './screens/about';
import TermsConditionScreen from './screens/termsconditions';
import PrivacyPolicyScreen from './screens/privacypolicy';
import AddCardScreen from './screens/addcard';
import OrderDetailScreen from './screens/myorders/orderdetail';
import HelpScreen from './screens/help';
import EvaluateOrderScreen from './screens/myorders/evaluate';
import MyCartScreen from './screens/mycart';
import CheckoutScreen from './screens/checkout';
import DeliveryTimeScreen from './screens/deliverytime';
import FavoriteScreen from './screens/favorite';
import RestaurantListScreen from './screens/restaurants';
import SearchScreen from './screens/search';
import SelectLocationScreen from './screens/selectlocation';
import BellboyInfoScreen from './screens/bellboyinfo';
import ReviewAllScreen from './screens/reviewall';
import SearchProductScreen from './screens/searchproduct';
import HelpInteractionScreen from './screens/help/interaction';
import GoogleMapScreen from './screens/googlemap';

const SigninNavigator = createStackNavigator({
    first: FirstScreen,
    signinlist: SigninScreen,
    signinemail: SigninEmailScreen,
    forgotpassword: ForgotPasswordScreen,
    signup: SignupScreen,
    locationaddress: LocationAddressScreen,
    manualaddress: ManualAddressScreen,
    termscondition: TermsConditionScreen,
    privacypolicy: PrivacyPolicyScreen,
    selectlocation: SelectLocationScreen
}, {
    initialRouteName: 'first',
    headerMode: 'none'
})

const MainNavigator = createStackNavigator({
    home: HomeScreen,
    position: ActualPositionScreen,
    searchfilter: SearchFilterScreen,
    restaurant: RestaurantScreen,
    restaurantinfo: RestaurantInfoScreen,
    productdetail: ProductDetailScreen,
    productnote: ProductNoteScreen,
    restaurantnote: RestaurantNoteScreen,
    account: AccountScreen,
    profile: ProfileScreen,
    myorders: MyOrderScreen,
    myaddress: MyAddressScreen,
    newaddress: NewAddressScreen,
    about: AboutScreen,
    paymentmethod: PaymentMethodScreen,
    termscondition: TermsConditionScreen,
    privacypolicy: PrivacyPolicyScreen,
    addcard: AddCardScreen,
    orderdetail: OrderDetailScreen,
    help: HelpScreen,
    helpinteraction: HelpInteractionScreen,
    evaluateorder: EvaluateOrderScreen,
    mycart: MyCartScreen,
    checkout: CheckoutScreen,
    deliverytime: DeliveryTimeScreen,
    favorite: FavoriteScreen,
    restaurants: RestaurantListScreen,
    search: SearchScreen,
    selectlocation: SelectLocationScreen,
    bellboy: BellboyInfoScreen,
    reviewall: ReviewAllScreen,
    searchproduct: SearchProductScreen,
    googlemap: GoogleMapScreen,

    first: FirstScreen,
    signinlist: SigninScreen,
    signinemail: SigninEmailScreen,
    forgotpassword: ForgotPasswordScreen,
    signup: SignupScreen,
    locationaddress: LocationAddressScreen,
    manualaddress: ManualAddressScreen,
    termscondition: TermsConditionScreen,
    privacypolicy: PrivacyPolicyScreen,
    selectlocation: SelectLocationScreen
}, {
    initialRouteName: 'first',
    headerMode: 'none'
})

const MainSwitchNavigator = createSwitchNavigator({
    authloading: AuthLoading,
    // signin: SigninNavigator,
    main: MainNavigator 
}, {
    initialRouteName: 'authloading'
})

export default AppContainer = createAppContainer(MainSwitchNavigator)