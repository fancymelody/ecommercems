<template>
  <div class="login-container">
    <div class="login-box">
      <!-- 头像区域 -->
      <div class="avatar_box">
        <img src="../assets/logo.png">
      </div>
      <!-- 登录表单区 -->
      <!-- ref为引用,就代表这个对象 -->
      <el-form ref="loginFormRef" :model="loginForm" :rules="loginFormRules" label-width="0px" class="login-form">
        <!-- 用户名 -->
        <el-form-item prop="username">
          <el-input v-model="loginForm.username" prefix-icon="iconfont icon-user" placeholder="请输入用户名"></el-input>
        </el-form-item>
        <!-- 密码 -->
        <el-form-item prop="password">
          <el-input v-model="loginForm.password" prefix-icon="iconfont icon-3702mima" type="password"
            placeholder="请输入密码"></el-input>
        </el-form-item>
        <!-- button -->
        <el-form-item class="btns">
          <el-button @click="login" type="primary">登录</el-button>
          <el-button @click="resetLoginForm" type="info">重置</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
  export default {
    data() {
      return {
        loginForm: {
          username: '',
          password: ''
        },
        loginFormRules: {
          username: [
            { required: true, message: '请输入用户名', trigger: 'blur' },
            { min: 3, max: 10, message: '长度在 3 到 10 个字符', trigger: 'blur' }
          ],
          password: [
            { required: true, message: '请输入密码', trigger: 'blur' },
            { min: 6, max: 15, message: '长度在 6 到 15 个字符', trigger: 'blur' }
          ],
        }
      }
    },
    methods: {
      // 重置表单
      resetLoginForm() {
        // console.log(this)
        this.$refs.loginFormRef.resetFields()
      },
      // 登录
      login() {
        // validate为表单预验证,valid为预验证是否正确,async为异步,可以直接返回服务器返回的数据
        this.$refs.loginFormRef.validate(async (valid) => {
          // console.log(valid)
          if (!valid) return;
          const result = await this.$http.post('login', this.loginForm);
          // console.log(result)
          if (result.data.meta.status !== 200) {
            this.$message.error('登录失败');
          } else {
            this.$message.success('登录成功');
            // 1. 将登录成功后的token保存到客户端的sessionStorage中
            //  1.1 项目中除了登录之外的其他API接口,必须在登录之后才能访问
            //  1.2 token只应当在当前网站打开期间有效,所以将token保存在sessionStorage中
            // 2. 通过编程式导航跳转到后台主页，路由地址是/home
            console.log(result.data)
            window.sessionStorage.setItem('token',result.data.data.token);
            this.$router.push('/home');
          }
        })
      }
    }
  }
</script>

<style scoped>
  .login-container {
    background-color: #2b4b6b;
    height: 100%;
  }

  .login-box {
    width: 450px;
    height: 300px;
    background-color: #fff;
    border-radius: 3px;
    /* 垂直居中 */
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
  }

  .avatar_box {
    height: 130px;
    width: 130px;
    border: 1px solid #eee;
    border-radius: 50%;
    padding: 10px;
    box-shadow: 0 0 10px #ddd;
    position: absolute;
    left: 50%;
    transform: translate(-50%, -50%);
    background-color: #fff;
  }

  .avatar_box img {
    width: 100%;
    height: 100%;
    border-radius: 50%;
    background-color: #eee;
  }

  .login-form {
    position: absolute;
    bottom: 0;
    width: 100%;
    padding: 0 20px;
    box-sizing: border-box;
  }

  .btns {
    display: flex;
    justify-content: flex-end;
  }
</style>