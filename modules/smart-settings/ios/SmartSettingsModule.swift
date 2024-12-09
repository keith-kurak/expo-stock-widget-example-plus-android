import ExpoModulesCore
import WidgetKit

public class SmartSettingsModule: Module {
    public func definition() -> ModuleDefinition {
        Name("SmartSettings")

        
        
        Function("remove") { (forKey: String, suiteName: String?) in
            UserDefaults(suiteName: suiteName)?.removeObject(forKey: forKey)
        }

        Function("reloadWidget") { (timeline: String?) in
            if let timeline = timeline {
                WidgetCenter.shared.reloadTimelines(ofKind: timeline)
            } else {
                WidgetCenter.shared.reloadAllTimelines()
            }
        }

        Function("setArray") { (forKey: String, data: [[String: Any]], suiteName: String?) -> Bool in
            // Convert the incoming array of dictionaries directly to JSON data
            do {
                let jsonData = try JSONSerialization.data(withJSONObject: data, options: [])
                UserDefaults(suiteName: suiteName)?.set(jsonData, forKey: forKey)
                return true
            } catch {
                // If encoding fails for some reason, return false
                return false
            }
        }
        
        Function("setObject") { (forKey: String, data: [String: Any], suiteName: String?) -> Bool in
            // Convert the incoming array of dictionaries directly to JSON data
            do {
                let jsonData = try JSONSerialization.data(withJSONObject: data, options: [])
                UserDefaults(suiteName: suiteName)?.set(jsonData, forKey: forKey)
                return true
            } catch {
                // If encoding fails for some reason, return false
                return false
            }
        }
        
        Function("setInt") { (key: String, value: Int, group: String?) in
            let userDefaults = UserDefaults(suiteName: group)
            userDefaults?.set(value, forKey: key)
        }
        
        
        
        // Function that updates the widget's history data in shared UserDefaults.
        // Arguments:
        // - history: [[String: Any]] array representing history items from JS.
        // - suiteName: String for the App Group user defaults
        // - forKey: String for the key to store the encoded history.
        AsyncFunction("storeData") { (forKey: String, dataArray: [[String: Any]], suiteName: String?) -> Bool in
            // Convert the incoming array of dictionaries directly to JSON data
            do {
                let userDefaults = UserDefaults(suiteName: suiteName)
                let jsonData = try JSONSerialization.data(withJSONObject: dataArray, options: [])
                userDefaults?.set(jsonData, forKey: forKey)
                return true
            } catch {
                // If encoding fails for some reason, return false
                return false
            }
        }
    }
}
