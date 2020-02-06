<template>
    <div>
        <el-button @click="logout" type="info">退出</el-button>
    </div>
</template>

<script>
    export default {
        data() {
            return {

            }
        },
        methods: {
            logout() {
                window.sessionStorage.clear();
                this.$router.push('/login')
            }
        }
    }
</script>

<style scoped>

</style>