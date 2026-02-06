import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Wifi, CheckCircle, AlertCircle, Loader } from "lucide-react";

const IoTConnect: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center space-x-4">
                <button
                    onClick={() => navigate("/home")}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                    <ArrowLeft className="h-6 w-6 text-gray-600" />
                </button>
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">Connect IoT Device</h1>
                    <p className="text-sm text-gray-600 mt-1">Set up your smart sprinkler system</p>
                </div>
            </div>

            {/* Main Card */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                {/* Header Section */}
                <div className="bg-gradient-to-r from-blue-600 to-cyan-600 p-8 text-white text-center">
                    <div className="inline-flex p-4 bg-white/20 backdrop-blur-sm rounded-full mb-4">
                        <Wifi className="h-12 w-12" />
                    </div>
                    <h2 className="text-2xl font-bold mb-2">IoT Device Pairing</h2>
                    <p className="text-blue-100">Connect your smart sprinkler to GreenGrow</p>
                </div>

                {/* Content */}
                <div className="p-8 space-y-6">
                    {/* Status Message */}
                    <div className="p-6 bg-blue-50 border-l-4 border-blue-500 rounded-lg">
                        <div className="flex items-start space-x-3">
                            <AlertCircle className="h-6 w-6 text-blue-600 mt-0.5 flex-shrink-0" />
                            <div>
                                <h3 className="text-lg font-semibold text-blue-900 mb-2">
                                    IoT Integration Coming Soon
                                </h3>
                                <p className="text-sm text-blue-800 leading-relaxed">
                                    The IoT device connection feature is currently under development.
                                    Soon you'll be able to connect your smart sprinkler devices directly
                                    to the GreenGrow platform for seamless remote control and automation.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Setup Steps (Preview) */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-800">How It Will Work</h3>

                        <div className="space-y-3">
                            {/* Step 1 */}
                            <div className="flex items-start space-x-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
                                <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                                    1
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-semibold text-gray-800 mb-1">Power On Your Device</h4>
                                    <p className="text-sm text-gray-600">
                                        Turn on your IoT sprinkler device and ensure it's in pairing mode
                                    </p>
                                </div>
                                <Loader className="h-5 w-5 text-gray-400" />
                            </div>

                            {/* Step 2 */}
                            <div className="flex items-start space-x-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
                                <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                                    2
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-semibold text-gray-800 mb-1">Scan for Devices</h4>
                                    <p className="text-sm text-gray-600">
                                        The app will automatically detect nearby IoT devices
                                    </p>
                                </div>
                                <Wifi className="h-5 w-5 text-gray-400" />
                            </div>

                            {/* Step 3 */}
                            <div className="flex items-start space-x-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
                                <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                                    3
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-semibold text-gray-800 mb-1">Connect & Configure</h4>
                                    <p className="text-sm text-gray-600">
                                        Select your device and configure watering schedules and zones
                                    </p>
                                </div>
                                <CheckCircle className="h-5 w-5 text-gray-400" />
                            </div>
                        </div>
                    </div>

                    {/* Features Preview */}
                    <div className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-200">
                        <h3 className="text-lg font-semibold text-green-900 mb-3">
                            Upcoming Features
                        </h3>
                        <ul className="space-y-2 text-sm text-green-800">
                            <li className="flex items-center space-x-2">
                                <CheckCircle className="h-4 w-4 text-green-600" />
                                <span>Remote on/off control from anywhere</span>
                            </li>
                            <li className="flex items-center space-x-2">
                                <CheckCircle className="h-4 w-4 text-green-600" />
                                <span>Automated watering schedules based on weather</span>
                            </li>
                            <li className="flex items-center space-x-2">
                                <CheckCircle className="h-4 w-4 text-green-600" />
                                <span>Real-time water usage monitoring</span>
                            </li>
                            <li className="flex items-center space-x-2">
                                <CheckCircle className="h-4 w-4 text-green-600" />
                                <span>Multi-zone irrigation management</span>
                            </li>
                            <li className="flex items-center space-x-2">
                                <CheckCircle className="h-4 w-4 text-green-600" />
                                <span>Smart notifications and alerts</span>
                            </li>
                        </ul>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-3 pt-4">
                        <button
                            onClick={() => navigate("/home")}
                            className="flex-1 py-3 px-6 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-all transform hover:scale-[1.02]"
                        >
                            Back to Home
                        </button>
                        <button
                            disabled
                            className="flex-1 py-3 px-6 bg-gray-300 text-gray-500 font-semibold rounded-xl cursor-not-allowed"
                        >
                            Start Pairing (Coming Soon)
                        </button>
                    </div>
                </div>
            </div>

            {/* Help Card */}
            <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
                <h3 className="font-semibold text-gray-800 mb-2">Need Help?</h3>
                <p className="text-sm text-gray-600 mb-4">
                    If you have questions about IoT device compatibility or setup, please contact our support team.
                </p>
                <button
                    onClick={() => navigate("/support")}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-lg transition-colors"
                >
                    Contact Support
                </button>
            </div>
        </div>
    );
};

export default IoTConnect;
