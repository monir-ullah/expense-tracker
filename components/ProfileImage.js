import React, { useState, useEffect } from "react";
import { Button, View, Alert, Image } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { File, Paths } from "expo-file-system";
import AsyncStorage from "@react-native-async-storage/async-storage";

async function saveImage(localImageUri) {
  const destFile = new File(Paths.document, `profile_${Date.now()}.jpg`);
  const sourceFile = new File({ uri: localImageUri });
  await sourceFile.copy(destFile);
  await AsyncStorage.setItem("profileImagePath", destFile.uri);
  console.log("Image saved to:", destFile.uri);
  return destFile.uri;
}

export default function ProfileImage() {
  const [imageUri, setImageUri] = useState(null);
  const [uploadImageUri, setUploadImageUri] = useState(null);

  // On mount, load the stored image URI
  useEffect(() => {
    const loadImage = async () => {
      const uri = await AsyncStorage.getItem("profileImagePath");
      if (uri) setUploadImageUri(uri);
    };
    loadImage();
  }, []);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission required",
        "App needs permission to access media library."
      );
      return;
    }
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      quality: 1,
      aspect: [4, 3],
    });

    if (!result.canceled && result.assets && result.assets[0]?.uri) {
      try {
        const finalPath = await saveImage(result.assets[0].uri);
        setImageUri(finalPath);
        setUploadImageUri(finalPath); // update UI immediately
      } catch (err) {
        console.log("Error:", err);
      }
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Button
        title="Pick Image"
        onPress={pickImage}
        style={{ marginBottom: 16 }}
      />
      {(imageUri || uploadImageUri) && (
        <Image
          source={{ uri: imageUri ? imageUri : uploadImageUri }}
          style={{ width: 200, height: 200, marginTop: 16 }}
        />
      )}
    </View>
  );
}
