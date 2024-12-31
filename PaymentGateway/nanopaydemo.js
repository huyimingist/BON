<script src="https://pay.nano.to/latest.js"></script>
<button onclick="payWithNanoTo()">Pay Now</button>
<script>
function payWithNanoTo() {
    NanoPay.open({ 
        title: "Demo Payment",
        address: '@your-username', 
        amount: 0.1,
        notify: 'your@email.com',
        contact: true,
        shipping: {
            onShippingUpdate: function(details) {
                console.log('Shipping details:', details);
                return true;
            }
        },
        currency: 'USD',
        wallet: 'natrium',
        success: (block) => {
            console.log('Payment successful!', {
                hash: block.hash,
                amount: block.amount,
                email: block.email,
                shipping: block.shipping
            });
        }
    });
}
</script>