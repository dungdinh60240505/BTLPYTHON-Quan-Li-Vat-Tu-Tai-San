// Chakra imports
import {
  Avatar,
  Box,
  Button,
  Flex,
  Icon,
  Image,
  Text,
  useToast,
  useColorModeValue,
} from "@chakra-ui/react";
// Custom components
import Card from "components/card/Card.js";
import React from "react";
// Assets
import { MdUpload } from "react-icons/md";
import Dropzone from "views/admin/profile/components/Dropzone";

const API_BASE_URL = "http://127.0.0.1:8000/api/v1";

export default function Upload(props) {
  const { currentAvatarUrl, onUploadSuccess, ...rest } = props;
  // Chakra Color Mode
  const textColorPrimary = useColorModeValue("secondaryGray.900", "white");
  const brandColor = useColorModeValue("brand.500", "white");
  const textColorSecondary = "gray.400";
  const toast = useToast();
  const [isUploading, setIsUploading] = React.useState(false);

  const handleDrop = React.useCallback(
    async (acceptedFiles) => {
      const file = acceptedFiles?.[0];
      if (!file) {
        return;
      }

      try {
        setIsUploading(true);
        const token = localStorage.getItem("access_token");
        const formData = new FormData();
        formData.append("avatar", file);

        const response = await fetch(`${API_BASE_URL}/auth/me/avatar`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        });

        const responseData = await response.json().catch(() => null);
        if (!response.ok) {
          throw new Error(responseData?.detail || "Upload avatar failed");
        }

        onUploadSuccess?.(responseData);
        toast({
          title: "Avatar updated",
          status: "success",
        });
      } catch (error) {
        console.error("Upload avatar failed:", error);
        toast({
          title: "Upload avatar failed",
          description: error.message,
          status: "error",
        });
      } finally {
        setIsUploading(false);
      }
    },
    [onUploadSuccess, toast],
  );

  return (
    <Card {...rest} mb='20px' align='center' p='20px'>
      <Flex h='100%' direction={{ base: "column", "2xl": "row" }}>
        <Dropzone
          w={{ base: "100%", "2xl": "268px" }}
          me='36px'
          maxH={{ base: "60%", lg: "50%", "2xl": "100%" }}
          minH={{ base: "60%", lg: "50%", "2xl": "100%" }}
          onDrop={handleDrop}
          multiple={false}
          disabled={isUploading}
          accept={{
            "image/jpeg": [".jpg", ".jpeg"],
            "image/png": [".png"],
            "image/gif": [".gif"],
            "image/webp": [".webp"],
          }}
          content={
            <Box>
              <Icon as={MdUpload} w='80px' h='80px' color={brandColor} />
              <Flex justify='center' mx='auto' mb='12px'>
                <Text fontSize='xl' fontWeight='700' color={brandColor}>
                  {isUploading ? "Uploading..." : "Upload Avatar"}
                </Text>
              </Flex>
              <Text fontSize='sm' fontWeight='500' color='secondaryGray.500'>
                PNG, JPG, GIF, WEBP up to 2MB
              </Text>
            </Box>
          }
        />
        <Flex direction='column' pe='44px'>
          <Text
            color={textColorPrimary}
            fontWeight='bold'
            textAlign='start'
            fontSize='2xl'
            mt={{ base: "20px", "2xl": "50px" }}>
            Update your avatar
          </Text>
          <Text
            color={textColorSecondary}
            fontSize='md'
            my={{ base: "auto", "2xl": "10px" }}
            mx='auto'
            textAlign='start'>
            Drag and drop an image or click the upload box to choose a new avatar.
          </Text>
          
        </Flex>
      </Flex>
    </Card>
  );
}
