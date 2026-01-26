-- Add policy to allow users to delete their own sent messages
CREATE POLICY "Users can delete their sent messages" 
ON public.chat_messages 
FOR DELETE 
USING (auth.uid() = sender_id);

-- Also allow deleting received messages (so users can clean their inbox)
CREATE POLICY "Users can delete their received messages" 
ON public.chat_messages 
FOR DELETE 
USING (auth.uid() = receiver_id);