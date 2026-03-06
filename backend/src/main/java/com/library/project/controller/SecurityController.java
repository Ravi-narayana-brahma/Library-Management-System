package com.library.project.controller;

import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/security")
public class SecurityController {

    @Value("${ADMIN_SECRET_CODE}")
    private String adminSecretCode;

    @PostMapping("/verify-admin-code")
    public ResponseEntity<?> verifyCode(@RequestBody Map<String,String> body){

        String code = body.get("code");

        if(adminSecretCode.equals(code)){
            return ResponseEntity.ok(Map.of("success", true));
        }

        return ResponseEntity.ok(Map.of("success", false));
    }
}
